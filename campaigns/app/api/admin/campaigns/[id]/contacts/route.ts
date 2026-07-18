import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

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

    const campaignContacts = await prisma.campaignContact.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: "desc" },
    });

    const contactIds = campaignContacts.map((cc) => cc.contactId);
    const contacts = contactIds.length > 0
      ? await prisma.contact.findMany({
          where: { id: { in: contactIds } },
          select: { id: true, name: true, phone: true, email: true },
        })
      : [];

    const contactMap = new Map(contacts.map((c) => [c.id, c]));

    const enriched = campaignContacts.map((cc) => ({
      ...cc,
      contact: contactMap.get(cc.contactId) || null,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error fetching campaign contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign contacts" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { contactIds } = body;

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "contactIds array is required" },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const results = [];
    const errors = [];

    for (const contactId of contactIds) {
      try {
        const campaignContact = await prisma.campaignContact.create({
          data: {
            campaignId: id,
            contactId,
            trackingUuid: crypto.randomUUID(),
          },
        });
        results.push(campaignContact);
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          errors.push({ contactId, error: "Already assigned to this campaign" });
        } else {
          throw err;
        }
      }
    }

    // Fetch contact details for successfully created rows
    const createdContactIds = results.map((r) => r.contactId);
    const contacts = createdContactIds.length > 0
      ? await prisma.contact.findMany({
          where: { id: { in: createdContactIds } },
          select: { id: true, name: true, phone: true, email: true },
        })
      : [];
    const contactMap = new Map(contacts.map((c) => [c.id, c]));
    const enrichedResults = results.map((r) => ({
      ...r,
      contact: contactMap.get(r.contactId) || null,
    }));

    // If all contacts were already assigned, return 409
    if (results.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: "All contacts already assigned to this campaign", details: errors },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { assigned: enrichedResults.length, results: enrichedResults, errors },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning contacts:", error);
    return NextResponse.json(
      { error: "Failed to assign contacts" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const contactId = searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId query parameter is required" },
        { status: 400 }
      );
    }

    await prisma.campaignContact.deleteMany({
      where: {
        campaignId: id,
        contactId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing campaign contact:", error);
    return NextResponse.json(
      { error: "Failed to remove contact assignment" },
      { status: 500 }
    );
  }
}
