import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeSlug, normalizeSubdomain, slugError } from "@/lib/subdomain";

type ProjectBody = {
  subdomain?: string;
  email?: string;
  slug?: string;
  title?: string;
  tagline?: string;
  story?: string;
  targetGoal?: number | string;
  tierName?: string;
  tierPrice?: number | string;
  tierDescription?: string;
};

function wholeDollars(value: number | string | undefined): number | null {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(amount) || amount < 1 || amount > 10_000_000) return null;
  return amount;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProjectBody;
    const subdomain = normalizeSubdomain(body.subdomain || "");
    const email = body.email?.trim().toLowerCase() || "";
    const slug = normalizeSlug(body.slug || "");
    const title = body.title?.trim() || "";
    const tagline = body.tagline?.trim() || "";
    const story = body.story?.trim() || "";
    const tierName = body.tierName?.trim() || "Supporter";
    const tierDescription =
      body.tierDescription?.trim() || "A one-time pledge for this project.";
    const targetGoal = wholeDollars(body.targetGoal);
    const tierPrice = wholeDollars(body.tierPrice);
    const invalidSlug = slugError(slug);

    if (!subdomain || !email || !slug || !title || !tagline || !story) {
      return NextResponse.json(
        { error: "Email, slug, title, tagline, and story are required" },
        { status: 400 }
      );
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Enter the email on this subdomain" }, { status: 400 });
    }
    if (invalidSlug) {
      return NextResponse.json({ error: invalidSlug }, { status: 400 });
    }
    if (title.length > 120) {
      return NextResponse.json({ error: "Title must be 120 characters or fewer" }, { status: 400 });
    }
    if (tagline.length > 280) {
      return NextResponse.json({ error: "Tagline must be 280 characters or fewer" }, { status: 400 });
    }
    if (story.length > 8000) {
      return NextResponse.json({ error: "Story must be 8,000 characters or fewer" }, { status: 400 });
    }
    if (targetGoal === null || tierPrice === null) {
      return NextResponse.json(
        { error: "Goal and pledge price must be whole dollar amounts" },
        { status: 400 }
      );
    }

    const creator = await prisma.user.findUnique({
      where: { subdomain },
      select: { id: true, email: true, name: true },
    });

    if (!creator || creator.email.toLowerCase() !== email) {
      return NextResponse.json(
        { error: "That email does not own this subdomain" },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        creatorId: creator.id,
        slug,
        title,
        tagline,
        story,
        eyebrow: "JUST PUBLISHED",
        statusLabel: "LIVE",
        manifestoTitle: `Why ${title} exists`,
        targetGoal,
        status: "ACTIVE",
        tiers: {
          create: {
            name: tierName,
            priceUsd: tierPrice,
            description: tierDescription,
            perks: ["Name on this project's backer wall"],
            featured: true,
            sortOrder: 0,
          },
        },
      },
      select: { slug: true, title: true },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "This subdomain already has a project with that slug" },
        { status: 409 }
      );
    }
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
