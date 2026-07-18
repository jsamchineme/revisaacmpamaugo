import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    const channel = searchParams.get("channel"); // "whatsapp" | "email" | null (all)

    // Fetch SendLogs for this campaign's contacts
    const campaignContacts = await prisma.campaignContact.findMany({
      where: { campaignId: id },
      select: { id: true, contactId: true },
    });

    const campaignContactIds = campaignContacts.map((cc) => cc.id);
    const contactMap = new Map(campaignContacts.map((cc) => [cc.id, cc.contactId]));

    const where: Record<string, unknown> = {
      campaignContactId: { in: campaignContactIds },
    };
    if (channel) {
      where.channel = channel;
    }

    const sendLogs = await prisma.sendLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Fetch contact names
    const contactIds = [...new Set(sendLogs.map((log) => contactMap.get(log.campaignContactId)).filter(Boolean))] as string[];
    const contacts = contactIds.length > 0
      ? await prisma.contact.findMany({
          where: { id: { in: contactIds } },
          select: { id: true, name: true },
        })
      : [];
    const contactNameMap = new Map(contacts.map((c) => [c.id, c.name]));

    const result = sendLogs.map((log) => ({
      id: log.id,
      channel: log.channel,
      status: log.status,
      sentAt: log.sentAt?.toISOString() || null,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt.toISOString(),
      contactName: contactNameMap.get(contactMap.get(log.campaignContactId) || "") || "Unknown",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching send logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch send logs" },
      { status: 500 }
    );
  }
}
