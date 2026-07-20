import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import speakeasy from "speakeasy";
import { createHmac } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twoFactorRequired = session.user.twoFactorRequired ?? false;
  const twoFactorVerified = session.user.twoFactorVerified ?? false;

  if (!twoFactorRequired || twoFactorVerified) {
    return NextResponse.json(
      { error: "Two-factor verification not required" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { code } = body as { code: string };

  if (!code) {
    return NextResponse.json(
      { success: false, error: "Code is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.twoFactorSecret) {
    return NextResponse.json(
      { success: false, error: "Two-factor authentication not configured" },
      { status: 400 }
    );
  }

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!valid) {
    return NextResponse.json(
      { success: false, error: "Invalid code" },
      { status: 400 }
    );
  }

  const timestamp = Date.now().toString();
  const hmac = createHmac("sha256", process.env.NEXTAUTH_SECRET!)
    .update(session.user.id + timestamp)
    .digest("hex");

  return NextResponse.json({
    success: true,
    twoFactorHmac: hmac,
    twoFactorTimestamp: timestamp,
  });
}
