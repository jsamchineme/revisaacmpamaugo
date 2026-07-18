import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

const guestSchema = z.object({
  title: z.enum(["Mr", "Mrs", "Ms", "Dr"]),
  fullname: z.string().min(1, "Guest full name is required"),
  phone: z.string().regex(/^\+[1-9][0-9]{7,14}$/, "Phone must be in E.164 format (e.g., +2348012345678)"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
});

const registrationSchema = z.object({
  title: z.enum(["Mr", "Mrs", "Ms", "Dr"]).optional().or(z.literal("")),
  fullname: z.string().min(1, "Full name is required"),
  phone: z.string().regex(/^\+[1-9][0-9]{7,14}$/, "Phone must be in E.164 format (e.g., +2348012345678)"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  plusOne: z.boolean().default(false),
  plusOneGuests: z.array(guestSchema).max(5, "Maximum 5 guests allowed").default([]),
  whatsappOptIn: z.boolean().default(false),
}).passthrough();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Rate limit RSVP submissions: 10 per hour per IP
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(ip, "rsvp", 10, 60 * 60 * 1000);
    if (rateLimit.blocked) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter ?? 3600) } }
      );
    }

    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate < now) {
      return NextResponse.json(
        { error: "Registration closed — event has ended" },
        { status: 400 }
      );
    }

    if (event.capacity !== null && event.capacity !== undefined) {
      const registrationCount = await prisma.registration.count({
        where: { eventId: event.id },
      });

      if (registrationCount >= event.capacity) {
        return NextResponse.json(
          { error: "Registration closed — event is full" },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, fullname, phone, email, plusOne, plusOneGuests, whatsappOptIn, ...rest } = parsed.data;

    // Extract known fields, store the rest as customData
    const knownFields = new Set(["title", "fullname", "phone", "email", "plusOne", "plusOneGuests", "whatsappOptIn"]);
    const customData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (!knownFields.has(key)) {
        customData[key] = value;
      }
    }

    const registration = await prisma.registration.create({
      data: {
        eventId: event.id,
        title: title || "Mr",
        fullname,
        phone,
        email: email || null,
        plusOne,
        plusOneGuests: plusOneGuests.length > 0 ? JSON.stringify(plusOneGuests) : null,
        whatsappOptIn,
        customData: Object.keys(customData).length > 0 ? JSON.stringify(customData) : null,
      },
    });

    return NextResponse.json({ success: true, id: registration.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
