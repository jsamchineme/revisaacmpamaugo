import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

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
    const body = await request.json();
    const { phone, email } = body as { phone?: string; email?: string };

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const results: { channel: string; status: string; messageSid?: string; error?: string }[] = [];

    // Test WhatsApp
    if (phone && campaign.whatsappTemplateSid) {
      const waResult = await sendWhatsAppMessage(
        phone,
        campaign.whatsappTemplateSid,
        session.user.name || "Admin",
        `${process.env.APP_URL}/c/test-${Date.now()}`
      );

      results.push({
        channel: "whatsapp",
        status: waResult.success ? "sent" : "failed",
        messageSid: waResult.success ? waResult.messageSid : undefined,
        error: waResult.success ? undefined : waResult.error,
      });
    } else if (phone && !campaign.whatsappTemplateSid) {
      results.push({
        channel: "whatsapp",
        status: "skipped",
        error: "No WhatsApp template SID configured for this campaign",
      });
    }

    // Test Email
    if (email && campaign.emailBody) {
      const trackingUrl = `${process.env.APP_URL}/c/test-${Date.now()}`;
      const personalizedBody = campaign.emailBody
        .replace(/\{\{link\}\}/g, trackingUrl)
        + "\n\nTo unsubscribe, reply STOP to this email.";

      const emailResult = await sendEmail(email, `[TEST] ${campaign.title}`, personalizedBody);

      results.push({
        channel: "email",
        status: emailResult.success ? "sent" : "failed",
        error: emailResult.success ? undefined : emailResult.error,
      });
    } else if (email && !campaign.emailBody) {
      results.push({
        channel: "email",
        status: "skipped",
        error: "No email body configured for this campaign",
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error sending test messages:", error);
    return NextResponse.json(
      { error: "Failed to send test messages" },
      { status: 500 }
    );
  }
}
