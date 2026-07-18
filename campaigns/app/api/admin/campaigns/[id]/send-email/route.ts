import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
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

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (!campaign.emailBody) {
      return NextResponse.json(
        { error: "Campaign has no email body" },
        { status: 400 }
      );
    }

    const campaignContacts = await prisma.campaignContact.findMany({
      where: { campaignId: id },
    });

    const contactIds = campaignContacts.map((cc) => cc.contactId);
    const contacts = contactIds.length > 0
      ? await prisma.contact.findMany({
          where: { id: { in: contactIds } },
          select: { id: true, name: true, phone: true, email: true },
        })
      : [];

    const contactMap = new Map(contacts.map((c) => [c.id, c]));

    const results: { contactId: string; email: string; status: string; error?: string }[] = [];

    for (const row of campaignContacts) {
      const contact = contactMap.get(row.contactId);
      const contactEmail = contact?.email;
      if (!contactEmail) {
        continue;
      }

      const trackingUrl = `${process.env.APP_URL}/c/${row.trackingUuid}`;
      const personalizedBody = campaign.emailBody
        .replace(/\{\{link\}\}/g, trackingUrl)
        + "\n\nTo unsubscribe, reply STOP to this email.";

      const sendResult = await sendEmail(
        contactEmail,
        campaign.title,
        personalizedBody
      );

      if (sendResult.success) {
        await createSendLog(row.id, "email", "sent");
        await prisma.campaignContact.update({
          where: { id: row.id },
          data: { status: "sent" },
        });
        results.push({ contactId: row.contactId, email: contactEmail, status: "sent" });
      } else {
        await createSendLog(row.id, "email", "failed", sendResult.error);
        await prisma.campaignContact.update({
          where: { id: row.id },
          data: { status: "failed" },
        });
        results.push({ contactId: row.contactId, email: contactEmail, status: "failed", error: sendResult.error });
      }
    }

    return NextResponse.json({
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      skipped: campaignContacts.length - results.length,
      results,
    });
  } catch (error) {
    console.error("Error sending campaign emails:", error);
    return NextResponse.json(
      { error: "Failed to send campaign emails" },
      { status: 500 }
    );
  }
}
