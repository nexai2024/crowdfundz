import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/current-user";
import type { CampaignStatus, TaskStatus } from "@prisma/client";

export type StudioTask = {
  id: string;
  title: string;
  details: string;
  status: TaskStatus;
  phaseId: string | null;
};

export type StudioProject = {
  slug: string;
  title: string;
  tagline: string;
  story: string;
  eyebrow: string | null;
  statusLabel: string | null;
  manifestoTitle: string | null;
  manifestoQuote: string | null;
  targetGoal: number;
  status: CampaignStatus;
  repoUrl: string | null;
  repoBranch: string | null;
  ideEditor: string | null;
  ideApiKey: string | null;
  vercelProjectUrl: string | null;
  productionUrl: string | null;
  previewUrl: string | null;
  publicHref: string;
  tiers: Array<{
    id: string;
    name: string;
    priceUsd: number;
    description: string;
    perks: string[];
  }>;
  milestones: Array<{
    id: string;
    label: string;
    title: string;
    description: string;
  }>;
  tasks: StudioTask[];
  faqs: Array<{ id: string; question: string; answer: string }>;
  sandboxes: Array<{
    id: string;
    title: string;
    sandboxUrl: string;
    environment: string;
  }>;
  bounties: Array<{
    id: string;
    title: string;
    description: string;
    rewardUsd: number;
    status: string;
  }>;
  sponsors: Array<{
    id: string;
    sponsorName: string;
    websiteUrl: string;
    tierName: string;
    amountPaidUsd: number;
  }>;
};

export async function getStudioProject(
  userId: string,
  slug: string
): Promise<StudioProject | null> {
  const campaign = await prisma.campaign.findUnique({
    where: { creatorId_slug: { creatorId: userId, slug } },
    include: {
      creator: { select: { subdomain: true } },
      tiers: { orderBy: { sortOrder: "asc" } },
      phases: { orderBy: { sortOrder: "asc" } },
      tasks: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      sandboxes: { orderBy: { createdAt: "desc" } },
      bounties: { orderBy: { createdAt: "desc" } },
      sponsors: { where: { active: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!campaign) return null;

  const ideKey = await prisma.ideApiKey.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { key: true },
  });

  const subdomain = campaign.creator.subdomain;
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
    status: campaign.status,
    repoUrl: campaign.repoUrl,
    repoBranch: campaign.repoBranch,
    ideEditor: campaign.ideEditor,
    ideApiKey: ideKey?.key ?? null,
    vercelProjectUrl: campaign.vercelProjectUrl,
    productionUrl: campaign.productionUrl,
    previewUrl: campaign.previewUrl,
    publicHref: subdomain ? `/${subdomain}/${campaign.slug}` : "",
    tiers: campaign.tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      priceUsd: tier.priceUsd,
      description: tier.description,
      perks: tier.perks,
    })),
    milestones: campaign.phases.map((phase) => ({
      id: phase.id,
      label: phase.label,
      title: phase.title,
      description: phase.description,
    })),
    tasks: campaign.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      details: task.details,
      status: task.status,
      phaseId: task.phaseId,
    })),
    faqs: campaign.faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
    })),
    sandboxes: campaign.sandboxes.map((sandbox) => ({
      id: sandbox.id,
      title: sandbox.title,
      sandboxUrl: sandbox.sandboxUrl,
      environment: sandbox.environment,
    })),
    bounties: campaign.bounties.map((bounty) => ({
      id: bounty.id,
      title: bounty.title,
      description: bounty.description,
      rewardUsd: bounty.rewardUsd,
      status: bounty.status,
    })),
    sponsors: campaign.sponsors.map((sponsor) => ({
      id: sponsor.id,
      sponsorName: sponsor.sponsorName,
      websiteUrl: sponsor.websiteUrl,
      tierName: sponsor.tierName,
      amountPaidUsd: sponsor.amountPaidUsd,
    })),
  };
}

export async function assertCampaignOwner(campaignId: string) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, creatorId: user.id },
    select: { id: true },
  });
  if (!campaign) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return null;
}

export async function ownedCampaign(slug: string) {
  const user = await getSessionUser();
  if (!user) return { error: "Sign in required", status: 401 as const };
  const campaign = await prisma.campaign.findUnique({
    where: { creatorId_slug: { creatorId: user.id, slug } },
  });
  if (!campaign) return { error: "Project not found", status: 404 as const };
  return { user, campaign };
}

export function optionalHttpUrl(value: unknown): string | null | "invalid" {
  if (typeof value !== "string" || value.trim() === "") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return "invalid";
    return url.toString();
  } catch {
    return "invalid";
  }
}

export function requiredText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > max) return null;
  return text;
}

export function wholeDollars(value: unknown): number | null {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(amount) || amount < 1 || amount > 10_000_000) return null;
  return amount;
}
