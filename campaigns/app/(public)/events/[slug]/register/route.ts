import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

const guestSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  fullname: z.string().min(1, "Guest full name is required"),
  phone: z.string().regex(/^\+[1-9][0-9]{7,14}$/, "Phone must be in E.164 format (e.g., +2348012345678)"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
});

const registrationSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  fullname: z.string().optional().or(z.literal("")),
  phone: z.string().regex(/^\+[1-9][0-9]{7,14}$/, "Phone must be in E.164 format (e.g., +2348012345678)").or(z.literal("")).optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  attending: z.boolean().default(true),
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

    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const isAttending = parsed.data.attending !== false;

    if (isAttending && !parsed.data.fullname) {
      return NextResponse.json(
        { error: "Validation failed", details: { fieldErrors: { fullname: ["Full name is required"] } } },
        { status: 400 }
      );
    }

    if (isAttending && !parsed.data.phone) {
      return NextResponse.json(
        { error: "Phone number is required for attendees" },
        { status: 400 }
      );
    }

    if (isAttending && event.capacity !== null && event.capacity !== undefined) {
      const existingRegistrations = await prisma.registration.findMany({
        where: { eventId: event.id },
        select: { plusOneGuests: true },
      });

      const existingAttendees = existingRegistrations.reduce((sum, r) => {
        let guestCount = 0;
        if (r.plusOneGuests) {
          try {
            const guests = JSON.parse(r.plusOneGuests);
            if (Array.isArray(guests)) guestCount = guests.length;
          } catch (err) {
            console.error("Failed to parse plusOneGuests for capacity check:", err);
          }
        }
        return sum + 1 + guestCount;
      }, 0);

      const newAttendees = 1 + (parsed.data.plusOneGuests?.length ?? 0);

      if (existingAttendees + newAttendees > event.capacity) {
        return NextResponse.json(
          { error: "Registration closed — not enough spots remaining" },
          { status: 400 }
        );
      }
    }

    const { title, fullname, phone, email, attending, plusOne, plusOneGuests, whatsappOptIn, ...rest } = parsed.data;

    // Extract known fields, store the rest as customData
    const knownFields = new Set(["title", "fullname", "phone", "email", "attending", "plusOne", "plusOneGuests", "whatsappOptIn"]);
    const customData: Record<string, unknown> = { attending: attending !== false };
    for (const [key, value] of Object.entries(rest)) {
      if (!knownFields.has(key)) {
        customData[key] = value;
      }
    }

    const registration = await prisma.registration.create({
      data: {
        eventId: event.id,
        title: title || "",
        fullname,
        phone: phone || "",
        email: email || null,
        plusOne: isAttending ? plusOne : false,
        plusOneGuests: isAttending && plusOneGuests.length > 0 ? JSON.stringify(plusOneGuests) : null,
        whatsappOptIn: isAttending ? whatsappOptIn : false,
        customData: JSON.stringify(customData),
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
