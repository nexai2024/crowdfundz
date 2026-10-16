import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ownerMutation } from "@/lib/http";
import { optionalHttpUrl, requiredText, wholeDollars } from "@/lib/studio";

export async function GET(req: Request) {
  const campaignId = new URL(req.url).searchParams.get("campaignId");
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { paywalls: { orderBy: { requiredRaisedUsd: "asc" } } },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(
      campaign.paywalls.map((paywall) => ({
        id: paywall.id,
        title: paywall.title,
        description: paywall.description,
        requiredRaisedUsd: paywall.requiredRaisedUsd,
        locked: campaign.totalRaised < paywall.requiredRaisedUsd,
      }))
    );
  } catch (error) {
    console.error("Paywall GET error:", error);
    return NextResponse.json({ error: "Failed to fetch paywalls" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      campaignId?: string;
      title?: string;
      description?: string;
      requiredRaisedUsd?: number;
      contentUrl?: string;
    };
    if (!body.campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
    }

    const owner = await ownerMutation(req, body.campaignId);
    if (owner) return owner;

    const title = requiredText(body.title, 120);
    const contentUrl = optionalHttpUrl(body.contentUrl);
    const requiredRaisedUsd = wholeDollars(body.requiredRaisedUsd);
    if (!title || contentUrl === "invalid" || !contentUrl || requiredRaisedUsd === null) {
      return NextResponse.json({ error: "A paywall needs a title, URL, and unlock amount" }, { status: 400 });
    }

    const paywall = await prisma.milestonePaywall.create({
      data: {
        campaignId: body.campaignId,
        title,
        description: requiredText(body.description, 400) || "Included with a confirmed pledge",
        requiredRaisedUsd,
        contentUrl,
      },
    });

    return NextResponse.json(paywall);
  } catch (error) {
    console.error("Paywall POST error:", error);
    return NextResponse.json({ error: "Failed to create milestone paywall" }, { status: 500 });
  }
}
