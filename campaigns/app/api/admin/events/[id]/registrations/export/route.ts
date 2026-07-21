import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormConfig, FormField } from "@/lib/form-config-types";

const PRISMA_FIELDS = new Set([
  "title", "fullname", "phone", "email", "plusOne", "plusOneGuests", "whatsappOptIn",
]);

function escapeCSVField(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function row(...fields: string[]): string {
  return fields.map(escapeCSVField).join(",") + "\r\n";
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function fieldValue(
  reg: Record<string, unknown>,
  customData: Record<string, unknown>,
  fieldId: string
): string {
  if (PRISMA_FIELDS.has(fieldId)) {
    const v = reg[fieldId];
    if (v == null) return "";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    return String(v);
  }
  const v = customData[fieldId];
  return v != null ? String(v) : "";
}

type GuestRecord = Record<string, string | undefined>;

function parseGuests(plusOneGuests: string | null, customData: Record<string, unknown>): GuestRecord[] {
  if (plusOneGuests) {
    try {
      const arr = JSON.parse(plusOneGuests);
      if (Array.isArray(arr)) return arr as GuestRecord[];
    } catch {}
  }
  const guestKeys = Object.keys(customData).filter((k) => k.startsWith("guest"));
  if (guestKeys.length > 0) return [customData as GuestRecord];
  return [];
}

type ColumnDef = { id: string; label: string; type: string; subFields?: FormField[] };

function buildColumns(formConfig: FormConfig | null): ColumnDef[] {
  if (!formConfig) {
    return [
      { id: "title",        label: "Title",                type: "text" },
      { id: "fullname",     label: "Full Name",            type: "text" },
      { id: "phone",        label: "Phone",                type: "tel" },
      { id: "email",        label: "Email",                type: "email" },
      { id: "plusOne",      label: "Coming With Guests",   type: "checkbox" },
      { id: "whatsappOptIn",label: "WhatsApp Opt-In",      type: "checkbox" },
    ];
  }

  const conditionalIds = new Set(
    formConfig.fields
      .filter((f) => f.type === "checkbox" && f.conditional?.length)
      .flatMap((f) => f.conditional ?? [])
  );
  const checkboxIdsWithGuestGroup = new Set(
    formConfig.fields
      .filter(
        (f) =>
          f.type === "checkbox" &&
          f.conditional?.some((cid) =>
            formConfig.fields.find((ff) => ff.id === cid && ff.type === "guestGroup")
          )
      )
      .map((f) => f.id)
  );

  return formConfig.fields
    .filter(
      (f) =>
        (!conditionalIds.has(f.id) || f.type === "guestGroup") &&
        !checkboxIdsWithGuestGroup.has(f.id)
    )
    .map((f) => ({ id: f.id, label: f.label, type: f.type, subFields: f.subFields }));
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

    let formConfig: FormConfig | null = null;
    if (event.formConfig) {
      try { formConfig = JSON.parse(event.formConfig); } catch {}
    }

    const where: Record<string, unknown> = { eventId: id };
    if (whatsappOnly) where.whatsappOptIn = true;

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const columns = buildColumns(formConfig);
    const regularCols = columns.filter((c) => c.type !== "guestGroup");
    const guestGroupCol = columns.find((c) => c.type === "guestGroup");
    const guestSubFields = guestGroupCol?.subFields ?? [];

    // Header: Type | regular columns | guest sub-fields (if any) | Registered At
    let csv =
      "\xEF\xBB\xBF" +
      row(
        "Registrant Type",
        ...regularCols.map((c) => c.label),
        ...guestSubFields.map((sf) => sf.label),
        "Registered At"
      );

    for (const reg of registrations) {
      let customData: Record<string, unknown> = {};
      if (reg.customData) {
        try { customData = JSON.parse(reg.customData); } catch {}
      }

      const regRecord = reg as unknown as Record<string, unknown>;
      const dateStr = formatDate(reg.createdAt);

      // Primary registrant row
      csv += row(
        "Primary",
        ...regularCols.map((c) => fieldValue(regRecord, customData, c.id)),
        ...guestSubFields.map(() => ""),
        dateStr
      );

      // Guest sub-rows
      const guests = parseGuests(reg.plusOneGuests, customData);
      for (const guest of guests) {
        csv += row(
          "Guest",
          ...regularCols.map((c) => {
            // Use guest-specific value if present, fall back to main registrant's phone
            const v = guest[c.id];
            if (v != null && v !== "") return String(v);
            if (c.id === "phone") return reg.phone;
            if (c.id === "whatsappOptIn") return reg.whatsappOptIn ? "Yes" : "No";
            return "";
          }),
          ...guestSubFields.map((sf) => {
            const v = guest[sf.id];
            return v != null ? String(v) : "";
          }),
          dateStr
        );
      }
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `registrations-${event.slug}-${dateStr}.csv`;

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
