import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const settingsKeys = [
  "siteTitle",
  "tagline",
  "email",
  "phone",
  "location",
  "facebook",
  "youtube",
  "instagram",
] as const;

type SettingsKey = (typeof settingsKeys)[number];

const settingsUpdateSchema = z.object({
  siteTitle: z.string().optional(),
  tagline: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
});

function settingsToObject(settings: { key: string; value: string }[]) {
  const obj: Record<string, string> = {};
  for (const s of settings) {
    obj[s.key] = s.value;
  }
  return obj;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findMany({
      where: { key: { in: settingsKeys as unknown as string[] } },
    });

    const obj = settingsToObject(settings);

    return NextResponse.json({
      siteTitle: obj.siteTitle || "The Ministry of Rev. Isaac Mpamaugo",
      tagline: obj.tagline || "A lifetime of faithful service, sermons, and teaching",
      email: obj.email || "hello@isaacmpamaugo.org",
      phone: obj.phone || "+234 (0)800 000 0000",
      location: obj.location || "Lagos, Nigeria",
      facebook: obj.facebook || "",
      youtube: obj.youtube || "",
      instagram: obj.instagram || "",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = settingsUpdateSchema.parse(body);

    const updates = Object.entries(validatedData).filter(
      ([, v]) => v !== undefined
    ) as [SettingsKey, string][];

    await prisma.$transaction(
      updates.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
