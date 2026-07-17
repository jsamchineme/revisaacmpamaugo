import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { teachingSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teaching = await prisma.teaching.findUnique({
      where: { id },
    });

    if (!teaching) {
      return NextResponse.json(
        { error: "Teaching not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(teaching);
  } catch (error) {
    console.error("Error fetching teaching:", error);
    return NextResponse.json(
      { error: "Failed to fetch teaching" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = teachingSchema.parse(body);

    const teaching = await prisma.teaching.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(teaching);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Error updating teaching:", error);
    return NextResponse.json(
      { error: "Failed to update teaching" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.teaching.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting teaching:", error);
    return NextResponse.json(
      { error: "Failed to delete teaching" },
      { status: 500 }
    );
  }
}
