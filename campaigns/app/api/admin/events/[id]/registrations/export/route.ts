import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Guest {
  title?: string;
  fullname: string;
  phone?: string;
  email?: string;
}

function escapeCSVField(value: string): string {
  const needsQuoting = /[",\n]/.test(value);
  if (needsQuoting) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

function formatCSVRow(fields: string[]): string {
  return fields.map(escapeCSVField).join(",") + "\r\n";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const whatsappOnly = searchParams.get("whatsappOnly") === "true";

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const where: Record<string, unknown> = { eventId: id };
    if (whatsappOnly) {
      where.whatsappOptIn = true;
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "title",
      "fullname",
      "phone",
      "email",
      "plusOne",
      "whatsappOptIn",
      "registeredAt",
    ];

    let csv = "\xEF\xBB\xBF" + formatCSVRow(headers);

    for (const reg of registrations) {
      const registeredAt = reg.createdAt.toISOString();

      // Main registrant row
      csv += formatCSVRow([
        reg.title,
        reg.fullname,
        reg.phone,
        reg.email || "",
        reg.plusOne ? "Yes" : "No",
        reg.whatsappOptIn ? "Yes" : "No",
        registeredAt,
      ]);

      // Flatten plus-one guests into separate rows
      if (reg.plusOne && reg.plusOneGuests) {
        try {
          const guests = JSON.parse(reg.plusOneGuests) as Guest[];
          if (Array.isArray(guests)) {
            for (const guest of guests) {
              csv += formatCSVRow([
                guest.title || "",
                guest.fullname,
                guest.phone || "",
                guest.email || "",
                "Yes",
                reg.whatsappOptIn ? "Yes" : "No",
                registeredAt,
              ]);
            }
          }
        } catch {
          // Invalid JSON in plusOneGuests — skip guest rows
        }
      }
    }

    const slug = event.slug;
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `registrations-${slug}-${dateStr}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting registrations:", error);
    return NextResponse.json(
      { error: "Failed to export registrations" },
      { status: 500 }
    );
  }
}
