import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sameOriginOrForbid } from "@/lib/http";
import { assertCampaignOwner } from "@/lib/studio";

export async function GET(req: Request) {
  const campaignId = new URL(req.url).searchParams.get("campaignId");
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
  }

  const owner = await assertCampaignOwner(campaignId);
  if (owner) return owner;

  try {
    const metric = await prisma.buildMetric.findFirst({
      where: { campaignId },
      orderBy: { recordedAt: "desc" },
    });

    return NextResponse.json({
      pageViews: metric?.pageViews ?? 0,
      uniqueUsers: metric?.uniqueUsers ?? 0,
      commitsCount: metric?.commitsCount ?? 0,
      weeklyGrowth: metric?.weeklyGrowth ?? 0,
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const origin = sameOriginOrForbid(req);
  if (origin) return origin;

  try {
    const body = (await req.json()) as { campaignId?: string; kind?: string };
    if (!body.campaignId || body.kind !== "pageview") {
      return NextResponse.json({ error: "A page view needs a project" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: body.campaignId },
      select: { id: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const seen = (req.headers.get("cookie") ?? "").includes("cv_visitor=");
    const latest = await prisma.buildMetric.findFirst({
      where: { campaignId: campaign.id },
      orderBy: { recordedAt: "desc" },
    });

    if (!latest) {
      await prisma.buildMetric.create({
        data: {
          campaignId: campaign.id,
          pageViews: 1,
          uniqueUsers: 1,
          commitsCount: 0,
          weeklyGrowth: 0,
        },
      });
    } else {
      await prisma.buildMetric.update({
        where: { id: latest.id },
        data: {
          pageViews: { increment: 1 },
          ...(seen ? {} : { uniqueUsers: { increment: 1 } }),
        },
      });
    }

    const response = NextResponse.json({ ok: true });
    if (!seen) {
      const secure = new URL(req.headers.get("origin") || "http://localhost").protocol === "https:";
      response.headers.set(
        "Set-Cookie",
        `cv_visitor=1; Path=/; Max-Age=31536000; SameSite=Lax${secure ? "; Secure" : ""}`
      );
    }
    return response;
  } catch (error) {
    console.error("Analytics POST error:", error);
    return NextResponse.json({ error: "Failed to record analytics" }, { status: 500 });
  }
}
