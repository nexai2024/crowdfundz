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

export type BuildMetricView = {
  pageViews: number;
  uniqueUsers: number;
  commitsCount: number;
  weeklyGrowth: number;
};

export type IdeUpdateView = {
  id: string;
  editor: string;
  commitHash: string | null;
  commitMessage: string;
  linesAdded: number;
  linesDeleted: number;
  fileChanged: string | null;
  createdAt: string;
};

export type DemoSandboxView = {
  id: string;
  title: string;
  sandboxUrl: string;
  embedCode: string | null;
  environment: string;
  status: string;
};

export type GovernancePollView = {
  id: string;
  title: string;
  description: string;
  options: string[];
  status: string;
  expiresAt: string | null;
  votesCount: number;
};

export type BountyView = {
  id: string;
  title: string;
  description: string;
  rewardUsd: number;
  status: string;
};

export type ComplianceCheckView = {
  disclaimerVerified: boolean;
  kycStatus: string;
  jurisdiction: string;
  taxFormFiled: boolean;
};

export type SponsorSlotView = {
  id: string;
  sponsorName: string;
  logoUrl: string;
  websiteUrl: string;
  tierName: string;
  amountPaidUsd: number;
};

export type CollaborationLoopView = {
  id: string;
  partnerSubdomain: string;
  partnerSlug: string;
  partnerTitle: string;
  discountPercentage: number;
};

export type MilestonePaywallView = {
  id: string;
  title: string;
  description: string;
  requiredRaisedUsd: number;
  contentUrl: string;
  locked: boolean;
};

export type CampaignLandingData = {
  id: string;
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
  repoUrl: string | null;
  productionUrl: string | null;
  previewUrl: string | null;
  vercelProjectUrl: string | null;
  tiers: CampaignTierView[];
  backers: CampaignBackerView[];
  phases: CampaignPhaseView[];
  faqs: CampaignFaqView[];
  metrics?: BuildMetricView | null;
  ideUpdates?: IdeUpdateView[];
  sandboxes?: DemoSandboxView[];
  polls?: GovernancePollView[];
  bounties?: BountyView[];
  compliance?: ComplianceCheckView | null;
  sponsors?: SponsorSlotView[];
  collaborations?: CollaborationLoopView[];
  paywalls?: MilestonePaywallView[];
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
  email?: string;
  emailVerified?: boolean;
  payoutsConnected?: boolean;
  subdomain: string | null;
  headline: string;
  bio: string;
  projects: CreatorProjectCard[];
  platformHref: string;
  projectPathPrefix: string;
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
