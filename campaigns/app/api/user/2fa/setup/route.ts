import { auth } from "@/lib/auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = speakeasy.generateSecret({
    name: "Campaign Manager",
    length: 32,
  });

  const otpauthURL = speakeasy.otpauthURL({
    secret: secret.base32,
    encoding: "base32",
    label: session.user.email,
    issuer: "Campaign Manager",
  });

  const qrCodeDataUrl = await QRCode.toDataURL(otpauthURL);

  return NextResponse.json({
    secret: secret.base32,
    qrCodeDataUrl,
  });
}
