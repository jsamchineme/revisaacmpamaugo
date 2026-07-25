import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

function generateCode(existing: Set<string>): string {
  let code: string;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (existing.has(code));
  return code;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const links = await prisma.invitationCode.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(links);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body = await request.json();
  const noi = Number(body.noi);
  if (!noi || noi < 1 || noi > 5) {
    return NextResponse.json({ error: "noi must be between 1 and 5" }, { status: 400 });
  }
  const label: string | undefined = body.label?.trim() || undefined;

  const existing = await prisma.invitationCode.findMany({
    where: { eventId: id },
    select: { code: true },
  });
  const existingCodes = new Set(existing.map((e) => e.code));
  const code = generateCode(existingCodes);

  const link = await prisma.invitationCode.create({
    data: { eventId: id, noi, code, label },
  });

  return NextResponse.json(link, { status: 201 });
}
