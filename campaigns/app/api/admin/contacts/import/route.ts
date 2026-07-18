import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

interface CSVRow {
  name: string;
  phone: string | null;
  email: string | null;
}

interface ImportResult {
  imported: number;
  updated: number;
  errors: string[];
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    if (headers.length === 0) {
      return NextResponse.json(
        { error: "Invalid CSV: missing header row" },
        { status: 400 }
      );
    }

    const nameIdx = headers.indexOf("name");
    const phoneIdx = headers.indexOf("phone");
    const emailIdx = headers.indexOf("email");

    if (nameIdx === -1 || phoneIdx === -1) {
      return NextResponse.json(
        { error: "Invalid CSV: missing required headers (name, phone)" },
        { status: 400 }
      );
    }

    const result: ImportResult = { imported: 0, updated: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;

      const name = row[nameIdx]?.trim();
      const phoneRaw = row[phoneIdx]?.trim();
      const email = emailIdx !== -1 ? row[emailIdx]?.trim() || null : null;

      if (!name) {
        result.errors.push(`Row ${i + 2}: missing name`);
        continue;
      }

      const normalizedPhone = normalizePhone(phoneRaw);
      if (!normalizedPhone) {
        result.errors.push(`Row ${i + 2}: invalid phone number`);
        continue;
      }

      try {
        const existing = await prisma.contact.findUnique({
          where: { phone: normalizedPhone },
        });

        if (existing) {
          await prisma.contact.update({
            where: { id: existing.id },
            data: {
              name,
              email: email || existing.email,
            },
          });
          result.updated++;
        } else {
          await prisma.contact.create({
            data: {
              name,
              phone: normalizedPhone,
              email: email || null,
            },
          });
          result.imported++;
        }
      } catch (err) {
        result.errors.push(`Row ${i + 2}: database error`);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing contacts:", error);
    return NextResponse.json(
      { error: "Failed to import contacts" },
      { status: 500 }
    );
  }
}
