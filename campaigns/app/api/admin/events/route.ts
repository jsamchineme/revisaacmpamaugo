import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { eventSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, slug, date, description, capacity, imageUrl, designContent, formConfig } = parsed.data;

    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "An event with this slug already exists" },
        { status: 409 }
      );
    }

    const capacityNum = capacity && capacity.trim() !== "" ? parseInt(capacity, 10) : null;

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        date: new Date(date),
        description: description || null,
        capacity: capacityNum,
        imageUrl: imageUrl || null,
        designContent: designContent || null,
        formConfig: formConfig || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
