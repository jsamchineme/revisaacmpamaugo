import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const campaignContacts = await prisma.campaignContact.findMany({
      where: { campaignId: id },
    });

    const totalContacts = campaignContacts.length;
    const sentCount = campaignContacts.filter(
      (cc) => cc.status === "sent" || cc.status === "failed"
    ).length;

    const campaignContactIds = campaignContacts.map((cc) => cc.id);
    const clickEvents = campaignContactIds.length > 0
      ? await prisma.clickEvent.findMany({
          where: { campaignContactId: { in: campaignContactIds } },
        })
      : [];

    const clickedCampaignContactIds = new Set(
      clickEvents.map((ce) => ce.campaignContactId)
    );
    const clickedCount = clickedCampaignContactIds.size;

    const clickRate =
      totalContacts > 0 ? Math.round((clickedCount / totalContacts) * 100) : null;

    return NextResponse.json({
      totalContacts,
      sentCount,
      clickedCount,
      clickRate,
    });
  } catch (error) {
    console.error("Error fetching campaign analytics summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
