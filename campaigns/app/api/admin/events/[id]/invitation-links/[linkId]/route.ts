import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, linkId } = await params;

  const link = await prisma.invitationCode.findFirst({
    where: { id: linkId, eventId: id },
  });
  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

  await prisma.invitationCode.delete({ where: { id: linkId } });
  return NextResponse.json({ success: true });
}
