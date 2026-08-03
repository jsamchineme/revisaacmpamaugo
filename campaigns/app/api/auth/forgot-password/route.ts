import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";

const APP_URL = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rateLimit = await checkRateLimit(ip, "forgot-password", 5, 15 * 60 * 1000);
  if (rateLimit.blocked) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { email } = await req.json();

  // Always return success — never reveal whether the email exists
  if (!email || typeof email !== "string") {
    return NextResponse.json({ success: true });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (user) {
    // Clean up any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, email: user.email, expiresAt },
    });

    const resetLink = `${APP_URL}/admin/reset-password?token=${token}`;

    await sendEmail(
      user.email,
      "Reset your password",
      `Hi ${user.name},\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nThis link expires in 1 hour. If you did not request this, you can safely ignore this email.\n\nCampaign Manager`
    );
  }

  return NextResponse.json({ success: true });
}
