import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    const campaignContact = await prisma.campaignContact.findUnique({
      where: { trackingUuid: uuid },
    });

    if (!campaignContact) {
      return new NextResponse("Not found", { status: 404 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignContact.campaignId },
    });

    if (!campaign) {
      return new NextResponse("Not found", { status: 404 });
    }

    await prisma.clickEvent.create({
      data: {
        campaignContactId: campaignContact.id,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.redirect(campaign.link, 302);
  } catch (error) {
    console.error("Error tracking click:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
