import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { createSendLog } from "@/lib/sendLog";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify campaign exists and has a WhatsApp template SID
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (!campaign.whatsappTemplateSid) {
      return NextResponse.json(
        { error: "Campaign has no WhatsApp template SID configured" },
        { status: 400 }
      );
    }

    // Fetch campaign contacts with contact details via manual queries
    const campaignContacts = await prisma.campaignContact.findMany({
      where: { campaignId: id },
    });

    if (campaignContacts.length === 0) {
      return NextResponse.json(
        { error: "No contacts assigned to this campaign" },
        { status: 400 }
      );
    }

    const contactIds = campaignContacts.map((cc) => cc.contactId);
    const contacts = contactIds.length > 0
      ? await prisma.contact.findMany({
          where: { id: { in: contactIds } },
          select: { id: true, name: true, phone: true, email: true },
        })
      : [];

    const contactMap = new Map(contacts.map((c) => [c.id, c]));

    const results: {
      campaignContactId: string;
      contactName: string;
      phone: string | null;
      status: string;
      messageSid?: string;
      error?: string;
    }[] = [];

    for (const cc of campaignContacts) {
      const contact = contactMap.get(cc.contactId);

      // Skip contacts without a phone number
      if (!contact || !contact.phone) {
        results.push({
          campaignContactId: cc.id,
          contactName: contact?.name || "Unknown",
          phone: contact?.phone || null,
          status: "skipped",
          error: "No phone number",
        });
        continue;
      }

      const trackingLink = `${process.env.APP_URL}/c/${cc.trackingUuid}`;

      const sendResult = await sendWhatsAppMessage(
        contact.phone,
        campaign.whatsappTemplateSid,
        contact.name,
        trackingLink
      );

      if (sendResult.success) {
        await createSendLog(cc.id, "whatsapp", "sent");
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: { status: "sent" },
        });
        results.push({
          campaignContactId: cc.id,
          contactName: contact.name,
          phone: contact.phone,
          status: "sent",
          messageSid: sendResult.messageSid,
        });
      } else {
        await createSendLog(cc.id, "whatsapp", "failed", sendResult.error);
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: { status: "failed" },
        });
        results.push({
          campaignContactId: cc.id,
          contactName: contact.name,
          phone: contact.phone,
          status: "failed",
          error: sendResult.error,
        });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;

    return NextResponse.json({
      sent,
      failed,
      skipped,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error("Error sending WhatsApp messages:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp messages" },
      { status: 500 }
    );
  }
}
