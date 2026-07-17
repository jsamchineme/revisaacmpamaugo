import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/admin/pages/[id] — get a single page with full sections
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

// PUT /api/admin/pages/[id] — update a page (sections, title, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, slug, metaDescription, sections, published } = body;

  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // If slug is changing, check uniqueness
  if (slug && slug !== existing.slug) {
    const slugConflict = await prisma.page.findUnique({ where: { slug } });
    if (slugConflict) {
      return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
    }
  }

  const updated = await prisma.page.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(sections !== undefined && { sections: typeof sections === "string" ? sections : JSON.stringify(sections) }),
      ...(published !== undefined && { published }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/admin/pages/[id] — delete a page
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await prisma.page.delete({ where: { id } });
  return NextResponse.json({ success: true });
}