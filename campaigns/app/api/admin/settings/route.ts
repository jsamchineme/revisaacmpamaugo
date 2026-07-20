import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_KEYS = ["featuredEventId", "fallbackUrl"] as const;
type SettingKey = (typeof ALLOWED_KEYS)[number];

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: [...ALLOWED_KEYS] } },
  });

  const result: Record<string, string> = {};
  for (const s of settings) result[s.key] = s.value;

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const upserts = ALLOWED_KEYS.filter((k) => k in body).map((key: SettingKey) =>
    prisma.setting.upsert({
      where: { key },
      update: { value: String(body[key] ?? "") },
      create: { key, value: String(body[key] ?? "") },
    })
  );

  await Promise.all(upserts);

  return NextResponse.json({ ok: true });
}
