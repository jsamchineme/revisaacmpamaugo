import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/pages — list all pages
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await prisma.page.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      metaDescription: true,
      published: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(pages);
}

// POST /api/admin/pages — create a new page
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug, metaDescription } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
  }

  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
  }

  const page = await prisma.page.create({
    data: {
      title,
      slug,
      metaDescription: metaDescription ?? null,
      sections: JSON.stringify([]),
      published: false,
    },
  });

  return NextResponse.json(page, { status: 201 });
}