import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { teachingSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const published = searchParams.get("published");

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { scriptureRef: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (published !== null && published !== undefined) {
      where.published = published === "true";
    }

    const teachings = await prisma.teaching.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(teachings);
  } catch (error) {
    console.error("Error fetching teachings:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = teachingSchema.parse(body);

    const teaching = await prisma.teaching.create({
      data: validatedData,
    });

    return NextResponse.json(teaching, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating teaching:", error);
    return NextResponse.json(
      { error: "Failed to create teaching" },
      { status: 500 }
    );
  }
}
