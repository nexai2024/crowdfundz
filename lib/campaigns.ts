import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { creatorUrl, isOnCreatorHost, platformUrl } from "@/lib/hosts";
import { isReservedSubdomain } from "@/lib/subdomain";
import { allocationTotals } from "@/lib/escrow";
import { platformFeeCents } from "@/lib/platform-fee";
import { confirmOpenPledges } from "@/lib/pledges";
import { publicHttpUrl } from "@/lib/studio";
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

async function requestHost(): Promise<string> {
  return (await headers()).get("host") || "localhost:3000";
}

export async function getPlatformProjects(): Promise<PlatformProjectCard[]> {
  const host = await requestHost();
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    orderBy: { totalRaised: "desc" },
    take: 6,
    include: { creator: true },
  });
  return campaigns.flatMap((campaign) => {
    const subdomain = campaign.creator.subdomain;
    if (!subdomain) return [];

    return [
      {
        title: campaign.title,
        tagline: campaign.tagline,
        creatorName: campaign.creator.name || subdomain,
        subdomain,
        slug: campaign.slug,
        totalRaised: campaign.totalRaised,
        targetGoal: campaign.targetGoal,
        backerCount: campaign.backerCount,
        href: creatorUrl(host, subdomain, `/${campaign.slug}`),
        creatorHref: creatorUrl(host, subdomain),
      },
    ];
  });
}

export async function getCreatorHome(subdomain: string): Promise<CreatorHomeData | null> {
  if (isReservedSubdomain(subdomain)) return null;

  const creator = await prisma.user.findUnique({
    where: { subdomain },
    include: {
      campaigns: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!creator) return null;

  const host = await requestHost();
  const onCreatorHost = isOnCreatorHost(host, subdomain);
  const name = creator.name || subdomain;
  const statusRank = { ACTIVE: 0, PAUSED: 1, DRAFT: 2, COMPLETED: 3 } as const;
  const campaigns = creator.campaigns.filter((campaign) => campaign.status !== "DRAFT").sort((a, b) => {
    const statusDiff = statusRank[a.status] - statusRank[b.status];
    if (statusDiff !== 0) return statusDiff;
    return b.totalRaised - a.totalRaised;
  });

  return {
    name,
    subdomain: creator.subdomain ?? subdomain,
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

export async function getStudioHome(userId: string): Promise<CreatorHomeData | null> {
  const creator = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      campaigns: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!creator) return null;

  const subdomain = creator.subdomain;
  const name = creator.name || subdomain || "Your studio";
  const statusRank = { ACTIVE: 0, PAUSED: 1, DRAFT: 2, COMPLETED: 3 } as const;
  const campaigns = [...creator.campaigns].sort((a, b) => {
    const statusDiff = statusRank[a.status] - statusRank[b.status];
    if (statusDiff !== 0) return statusDiff;
    return b.totalRaised - a.totalRaised;
  });

  const pendingBacked = await prisma.backer.findMany({
    where: { email: { equals: creator.email, mode: "insensitive" }, status: "PENDING" },
    select: { campaignId: true },
  });
  await confirmOpenPledges([
    ...campaigns.map((campaign) => campaign.id),
    ...pendingBacked.map((pledge) => pledge.campaignId),
  ]);
  const refreshed = campaigns.length === 0 ? [] : await prisma.campaign.findMany({
    where: { id: { in: campaigns.map((campaign) => campaign.id) } },
    select: { id: true, totalRaised: true, backerCount: true },
  });
  const totals = new Map(refreshed.map((campaign) => [campaign.id, campaign]));

  const pledgesMade = await prisma.backer.findMany({
    where: { email: { equals: creator.email, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      name: true,
      amountUsd: true,
      status: true,
      createdAt: true,
      campaign: { select: { title: true, slug: true, creator: { select: { subdomain: true } } } },
    },
  });

  const recentPledges = campaigns.length === 0 ? [] : await prisma.backer.findMany({
    where: { campaignId: { in: campaigns.map((campaign) => campaign.id) } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      name: true,
      amountUsd: true,
      status: true,
      createdAt: true,
      campaign: { select: { title: true, slug: true } },
    },
  });

  return {
    name,
    email: creator.email,
    emailVerified: creator.emailVerified,
    payoutsConnected: Boolean(creator.stripeConnectAccountId),
    subdomain,
    headline: creator.headline || (subdomain ? `Projects by ${name}` : "Your projects are ready for a public name"),
    bio: subdomain
      ? creator.bio ||
        "Each project on this page is a live campaign. Open one to see the story, pledge levels, and backer wall."
      : "These campaigns stay off the public list until this account claims a subdomain.",
    platformHref: "/",
    projectPathPrefix: subdomain ? `/${subdomain}` : "",
    projects: campaigns.map((campaign) => ({
      slug: campaign.slug,
      title: campaign.title,
      tagline: campaign.tagline,
      status: campaign.status,
      targetGoal: campaign.targetGoal,
      totalRaised: totals.get(campaign.id)?.totalRaised ?? campaign.totalRaised,
      backerCount: totals.get(campaign.id)?.backerCount ?? campaign.backerCount,
      href: subdomain ? `/${subdomain}/${campaign.slug}` : "",
    })),
    recentPledges: recentPledges.map((pledge) => ({
      id: pledge.id,
      name: pledge.name,
      amountUsd: pledge.amountUsd,
      platformFeeCents: platformFeeCents(pledge.amountUsd),
      status: pledge.status,
      projectTitle: pledge.campaign.title,
      projectSlug: pledge.campaign.slug,
      createdAt: pledge.createdAt.toISOString(),
    })),
    pledgesMade: pledgesMade.map((pledge) => ({
      id: pledge.id,
      name: pledge.campaign.creator.subdomain ? `${pledge.campaign.creator.subdomain}/${pledge.campaign.slug}` : pledge.campaign.slug,
      amountUsd: pledge.amountUsd,
      platformFeeCents: platformFeeCents(pledge.amountUsd),
      status: pledge.status,
      projectTitle: pledge.campaign.title,
      projectSlug: pledge.campaign.slug,
      createdAt: pledge.createdAt.toISOString(),
    })),
  };
}

export async function getCampaignLanding(
  subdomain: string,
  slug: string
): Promise<CampaignLandingData | null> {
  if (isReservedSubdomain(subdomain)) return null;

  const creator = await prisma.user.findUnique({
    where: { subdomain },
  });
  if (!creator) return null;

  const campaignRef = await prisma.campaign.findUnique({
    where: { creatorId_slug: { creatorId: creator.id, slug } },
    select: { id: true, status: true },
  });
  if (!campaignRef || campaignRef.status === "DRAFT") return null;

  const campaign = await prisma.campaign.findUnique({
    where: { creatorId_slug: { creatorId: creator.id, slug } },
    include: {
      tiers: { orderBy: { sortOrder: "asc" } },
      phases: {
        orderBy: { sortOrder: "asc" },
        include: {
          allocations: {
            where: { status: { in: ["HELD", "RELEASING", "RELEASED"] } },
            select: { amountUsd: true, status: true },
          },
        },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      backers: {
        where: { status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      metrics: { orderBy: { recordedAt: "desc" }, take: 1 },
      ideUpdates: { orderBy: { createdAt: "desc" }, take: 5 },
      sandboxes: { take: 3 },
      polls: { orderBy: { createdAt: "desc" }, include: { _count: { select: { votes: true } } } },
      bounties: { orderBy: { createdAt: "desc" } },
      compliance: true,
      sponsors: { where: { active: true } },
      collaborations: true,
      paywalls: { orderBy: { requiredRaisedUsd: "asc" } },
    },
  });

  if (!campaign) return null;

  const host = await requestHost();
  const onCreatorHost = isOnCreatorHost(host, subdomain);
  const metric = campaign.metrics[0];

  return {
    id: campaign.id,
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
    creatorName: creator.name || creator.subdomain || subdomain,
    subdomain: creator.subdomain ?? subdomain,
    homeHref: onCreatorHost ? "/" : `/${subdomain}`,
    wallHref: onCreatorHost ? `/${slug}/wall` : `/${subdomain}/${slug}/wall`,
    repoUrl: publicHttpUrl(campaign.repoUrl),
    productionUrl: publicHttpUrl(campaign.productionUrl),
    previewUrl: publicHttpUrl(campaign.previewUrl),
    vercelProjectUrl: publicHttpUrl(campaign.vercelProjectUrl),
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
      platformFeeCents: platformFeeCents(backer.amountUsd),
      backerNumber: backer.backerNumber,
      message: backer.message,
    })),
    phases: campaign.phases.map((phase) => ({
      id: phase.id,
      label: phase.label,
      title: phase.title,
      description: phase.description,
      pullRequestMerged: Boolean(phase.pullRequestMergedAt),
      ...allocationTotals(phase.allocations),
    })),
    faqs: campaign.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
    metrics: metric
      ? {
          pageViews: metric.pageViews,
          uniqueUsers: metric.uniqueUsers,
          commitsCount: metric.commitsCount,
          weeklyGrowth: metric.weeklyGrowth,
        }
      : null,
    ideUpdates: campaign.ideUpdates.map((update) => ({
      id: update.id,
      editor: update.editor,
      commitHash: update.commitHash,
      commitMessage: update.commitMessage,
      linesAdded: update.linesAdded,
      linesDeleted: update.linesDeleted,
      fileChanged: update.fileChanged,
      createdAt: update.createdAt.toISOString(),
    })),
    sandboxes: campaign.sandboxes.flatMap((sb) => {
      const sandboxUrl = publicHttpUrl(sb.sandboxUrl);
      if (!sandboxUrl) return [];
      return [
        {
          id: sb.id,
          title: sb.title,
          sandboxUrl,
          embedCode: null,
          environment: sb.environment,
          status: sb.status,
        },
      ];
    }),
    polls: campaign.polls.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      options: p.options,
      status: p.status,
      expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
      votesCount: p._count.votes,
    })),
    bounties: campaign.bounties.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      rewardUsd: b.rewardUsd,
      status: b.status,
    })),
    compliance: campaign.compliance
      ? {
          disclaimerVerified: campaign.compliance.disclaimerVerified,
          kycStatus: campaign.compliance.kycStatus,
          jurisdiction: campaign.compliance.jurisdiction,
          taxFormFiled: campaign.compliance.taxFormFiled,
        }
      : null,
    sponsors: campaign.sponsors.flatMap((s) => {
      const websiteUrl = publicHttpUrl(s.websiteUrl);
      const logoUrl = publicHttpUrl(s.logoUrl);
      if (!websiteUrl || !logoUrl) return [];
      return [
        {
          id: s.id,
          sponsorName: s.sponsorName,
          logoUrl,
          websiteUrl,
          tierName: s.tierName,
          amountPaidUsd: s.amountPaidUsd,
        },
      ];
    }),
    collaborations: campaign.collaborations.map((c) => ({
      id: c.id,
      partnerSubdomain: c.partnerSubdomain,
      partnerSlug: c.partnerSlug,
      partnerTitle: c.partnerTitle,
      discountPercentage: c.discountPercentage,
    })),
    paywalls: campaign.paywalls.map((pw) => ({
      id: pw.id,
      title: pw.title,
      description: pw.description,
      requiredRaisedUsd: pw.requiredRaisedUsd,
      contentUrl: "",
      locked: campaign.totalRaised < pw.requiredRaisedUsd,
    })),
  };
}
