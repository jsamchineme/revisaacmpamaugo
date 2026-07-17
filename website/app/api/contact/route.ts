import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, phone, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  // Save to database
  await prisma.contactMessage.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      message: message.trim(),
    },
  });

  // Send email notification if SMTP is configured
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL } =
    process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: SMTP_SECURE === "true",
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: SMTP_FROM ?? `"Ministry Website" <${SMTP_USER}>`,
        to: ADMIN_EMAIL ?? SMTP_USER,
        replyTo: email.trim(),
        subject: `New message from ${name.trim()}`,
        text: [
          `Name: ${name.trim()}`,
          `Email: ${email.trim()}`,
          `Phone: ${phone?.trim() || "—"}`,
          "",
          message.trim(),
        ].join("\n"),
        html: `
          <p style="font-family:sans-serif;color:#1c1a17">
            <strong>Name:</strong> ${name.trim()}<br>
            <strong>Email:</strong> <a href="mailto:${email.trim()}">${email.trim()}</a><br>
            <strong>Phone:</strong> ${phone?.trim() || "—"}
          </p>
          <hr style="border:none;border-top:1px solid #e8e2d9;margin:20px 0">
          <p style="font-family:serif;font-size:1.05rem;color:#3a352e;white-space:pre-wrap">${message.trim()}</p>
          <hr style="border:none;border-top:1px solid #e8e2d9;margin:20px 0">
          <p style="font-family:sans-serif;font-size:.85rem;color:#7c7167">
            Sent from the contact form at Isaac Mpamaugo Ministry website.
          </p>
        `,
      });
    } catch (err) {
      // Log but don't fail the request — message is already saved to DB
      console.warn("Email send failed:", err);
    }
  } else {
    console.info(
      "SMTP not configured — message saved to DB only. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable email notifications."
    );
  }

  return NextResponse.json({ ok: true });
}
