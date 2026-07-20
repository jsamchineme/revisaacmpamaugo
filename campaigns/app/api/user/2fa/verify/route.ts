import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import speakeasy from "speakeasy";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { secret, token } = body as { secret: string; token: string };

  if (!secret || !token) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const valid = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!valid) {
    return NextResponse.json(
      { success: false, error: "Invalid code" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    },
  });

  return NextResponse.json({ success: true });
}
