export type CampaignTierView = {
  id: string;
  name: string;
  priceUsd: number;
  description: string;
  perks: string[];
  badge: string | null;
  featured: boolean;
};

export type CampaignBackerView = {
  id: string;
  name: string;
  handle: string | null;
  amountUsd: number;
  backerNumber: number;
  message: string | null;
};

export type CampaignPhaseView = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export type CampaignFaqView = {
  question: string;
  answer: string;
};

export type CampaignLandingData = {
  slug: string;
  title: string;
  tagline: string;
  story: string;
  eyebrow: string | null;
  statusLabel: string | null;
  manifestoTitle: string | null;
  manifestoQuote: string | null;
  targetGoal: number;
  totalRaised: number;
  backerCount: number;
  daysRemaining: number | null;
  creatorName: string;
  subdomain: string;
  homeHref: string;
  wallHref: string;
  tiers: CampaignTierView[];
  backers: CampaignBackerView[];
  phases: CampaignPhaseView[];
  faqs: CampaignFaqView[];
};

export type CreatorProjectCard = {
  slug: string;
  title: string;
  tagline: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "PAUSED";
  targetGoal: number;
  totalRaised: number;
  backerCount: number;
  href: string;
};

export type CreatorHomeData = {
  name: string;
  subdomain: string;
  headline: string;
  bio: string;
  projects: CreatorProjectCard[];
  platformHref: string;
};

export type PlatformProjectCard = {
  title: string;
  tagline: string;
  creatorName: string;
  subdomain: string;
  slug: string;
  totalRaised: number;
  targetGoal: number;
  backerCount: number;
  href: string;
  creatorHref: string;
};
