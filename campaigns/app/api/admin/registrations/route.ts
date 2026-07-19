import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId") || undefined;
    const whatsappOnly = searchParams.get("whatsappOnly") === "true";

    const where: Record<string, unknown> = {};
    if (eventId) where.eventId = eventId;
    if (whatsappOnly) where.whatsappOptIn = true;

    const [registrations, events] = await Promise.all([
      prisma.registration.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.findMany({
        select: { id: true, title: true, slug: true, date: true },
      }),
    ]);

    const eventMap = new Map(events.map((e) => [e.id, e]));

    const result = registrations.map((r) => ({
      ...r,
      event: eventMap.get(r.eventId) ?? null,
    }));

    return NextResponse.json({ registrations: result, events });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
