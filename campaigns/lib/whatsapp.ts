import twilio from "twilio";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !accountSid.startsWith("AC")) {
    throw new Error("TWILIO_ACCOUNT_SID is not configured");
  }
  if (!authToken) {
    throw new Error("TWILIO_AUTH_TOKEN is not configured");
  }

  return twilio(accountSid, authToken);
}

export async function sendWhatsAppMessage(
  phone: string,
  contentSid: string,
  contactName: string,
  trackingLink: string
): Promise<{ success: true; messageSid: string } | { success: false; error: string }> {
  try {
    const client = getTwilioClient();
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!from) {
      throw new Error("TWILIO_WHATSAPP_FROM is not configured");
    }

    const contentVariables = JSON.stringify({
      "1": contactName || "",
      "2": trackingLink,
    });

    const message = await client.messages.create({
      from,
      contentSid,
      contentVariables,
      to: `whatsapp:${phone}`,
    });

    return { success: true, messageSid: message.sid };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { success: false, error };
  }
}
