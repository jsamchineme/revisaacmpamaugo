import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { campaignSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { emailBody: { contains: search } },
      ];
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = campaignSchema.parse(body);

    const campaign = await prisma.campaign.create({
      data: {
        title: validatedData.title,
        whatsappTemplateSid: validatedData.whatsappTemplateSid || null,
        whatsappTemplateVariables: validatedData.whatsappTemplateVariables || null,
        emailBody: validatedData.emailBody || null,
        link: validatedData.link,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
