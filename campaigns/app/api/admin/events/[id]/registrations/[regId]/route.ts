import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, regId } = await params;

    const registration = await prisma.registration.findUnique({
      where: { id: regId },
    });

    if (!registration || registration.eventId !== id) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    await prisma.registration.delete({ where: { id: regId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 });
  }
}
