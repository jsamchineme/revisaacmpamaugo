import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<{ success: true; messageId?: string } | { success: false; error: string }> {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return { success: false, error: "SMTP not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: false,
      requireTLS: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: true,
      },
    });

    const info = await transporter.sendMail({
      from: SMTP_FROM ?? SMTP_USER,
      to,
      subject,
      text: body,
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`Email failed to ${to}: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}
