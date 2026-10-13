import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { creatorUrl, isOnCreatorHost, platformUrl } from "@/lib/hosts";
import type {
  CampaignLandingData,
  CreatorHomeData,
  PlatformProjectCard,
} from "@/lib/landing-types";

function daysRemaining(endsAt: Date | null): number | null {
  if (!endsAt) return null;
  const ms = endsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

function requestHost(): string {
  return headers().get("host") || "localhost:3000";
}

export async function getPlatformProjects(): Promise<PlatformProjectCard[]> {
  const host = requestHost();
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    orderBy: { totalRaised: "desc" },
    take: 6,
    include: { creator: true },
  });

  return campaigns.map((campaign) => ({
    title: campaign.title,
    tagline: campaign.tagline,
    creatorName: campaign.creator.name || campaign.creator.subdomain,
    subdomain: campaign.creator.subdomain,
    slug: campaign.slug,
    totalRaised: campaign.totalRaised,
    targetGoal: campaign.targetGoal,
    backerCount: campaign.backerCount,
    href: creatorUrl(host, campaign.creator.subdomain, `/${campaign.slug}`),
    creatorHref: creatorUrl(host, campaign.creator.subdomain),
  }));
}

export async function getCreatorHome(subdomain: string): Promise<CreatorHomeData | null> {
  const creator = await prisma.user.findUnique({
    where: { subdomain },
    include: {
      campaigns: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!creator) return null;

  const host = requestHost();
  const onCreatorHost = isOnCreatorHost(host, subdomain);
  const name = creator.name || subdomain;
  const statusRank = { ACTIVE: 0, PAUSED: 1, DRAFT: 2, COMPLETED: 3 } as const;
  const campaigns = [...creator.campaigns].sort((a, b) => {
    const statusDiff = statusRank[a.status] - statusRank[b.status];
    if (statusDiff !== 0) return statusDiff;
    return b.totalRaised - a.totalRaised;
  });

  return {
    name,
    subdomain: creator.subdomain,
    headline: creator.headline || `Projects by ${name}`,
    bio:
      creator.bio ||
      "Each project on this page is a live campaign. Open one to see the story, pledge levels, and backer wall.",
    platformHref: onCreatorHost ? platformUrl(host) : "/",
    projectPathPrefix: onCreatorHost ? "" : `/${subdomain}`,
    projects: campaigns.map((campaign) => ({
      slug: campaign.slug,
      title: campaign.title,
      tagline: campaign.tagline,
      status: campaign.status,
      targetGoal: campaign.targetGoal,
      totalRaised: campaign.totalRaised,
      backerCount: campaign.backerCount,
      href: onCreatorHost ? `/${campaign.slug}` : `/${subdomain}/${campaign.slug}`,
    })),
  };
}

export async function getCampaignLanding(
  subdomain: string,
  slug: string
): Promise<CampaignLandingData | null> {
  const creator = await prisma.user.findUnique({
    where: { subdomain },
  });
  if (!creator) return null;

  const campaign = await prisma.campaign.findUnique({
    where: { creatorId_slug: { creatorId: creator.id, slug } },
    include: {
      tiers: { orderBy: { sortOrder: "asc" } },
      phases: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      backers: {
        where: { status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  if (!campaign) return null;

  const host = requestHost();
  const onCreatorHost = isOnCreatorHost(host, subdomain);

  return {
    slug: campaign.slug,
    title: campaign.title,
    tagline: campaign.tagline,
    story: campaign.story,
    eyebrow: campaign.eyebrow,
    statusLabel: campaign.statusLabel,
    manifestoTitle: campaign.manifestoTitle,
    manifestoQuote: campaign.manifestoQuote,
    targetGoal: campaign.targetGoal,
    totalRaised: campaign.totalRaised,
    backerCount: campaign.backerCount,
    daysRemaining: daysRemaining(campaign.endsAt),
    creatorName: creator.name || creator.subdomain,
    subdomain: creator.subdomain,
    homeHref: onCreatorHost ? "/" : `/${subdomain}`,
    wallHref: onCreatorHost ? `/${slug}/wall` : `/${subdomain}/${slug}/wall`,
    tiers: campaign.tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      priceUsd: tier.priceUsd,
      description: tier.description,
      perks: tier.perks,
      badge: tier.badge,
      featured: tier.featured,
    })),
    backers: campaign.backers.map((backer) => ({
      id: backer.id,
      name: backer.name,
      handle: backer.handle,
      amountUsd: backer.amountUsd,
      backerNumber: backer.backerNumber,
      message: backer.message,
    })),
    phases: campaign.phases.map((phase) => ({
      id: phase.id,
      label: phase.label,
      title: phase.title,
      description: phase.description,
    })),
    faqs: campaign.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  };
}
