import "dotenv/config";
import type { CampaignStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.ts";

const endsIn = (days: number) => new Date(Date.now() + days * 86_400_000);

type TierSeed = {
  name: string;
  priceUsd: number;
  description: string;
  perks: string[];
  badge?: string;
  featured?: boolean;
  limit?: number;
  sortOrder: number;
};

type ProjectSeed = {
  slug: string;
  title: string;
  tagline: string;
  story: string;
  eyebrow?: string;
  statusLabel?: string;
  manifestoTitle?: string;
  manifestoQuote?: string;
  endsAt?: Date;
  targetGoal: number;
  totalRaised: number;
  backerCount: number;
  status: CampaignStatus;
  tiers: TierSeed[];
  phases?: { label: string; title: string; description: string }[];
  faqs?: { question: string; answer: string }[];
  backers?: { name: string; handle?: string; email: string; amountUsd: number; message?: string; tierIndex: number }[];
};

const protocol100: ProjectSeed = {
  slug: "protocol100",
  title: "Protocol100",
  tagline:
    "Fuel the Protocol100 experiment. A structured 100-day execution framework that forces solo founders to ship, launch, and monetize their software out in the open.",
  eyebrow: "LIVE BUILD-IN-PUBLIC EXPERIMENT",
  statusLabel: "DAY 0 OF 100 · PUBLIC SPRINT",
  manifestoTitle: "Tech bloat takes millions. Grit takes code.",
  manifestoQuote:
    "A $2 donation is an algorithmic signal: a vote against tech gatekeeping and proof that independent software belongs to independent builders.",
  story:
    "Venture capital funds 50-person engineering teams that spend 18 months deciding on button radiuses and burn runways on overhead. Meanwhile, thousands of solo engineers with working code give up because building alone without audience feedback is brutal.\n\nProtocol100 proves that one engineer with disciplined milestones, transparent metrics, and public accountability can deliver more value than a bloated software studio.",
  endsAt: endsIn(28),
  targetGoal: 5000,
  totalRaised: 1420,
  backerCount: 6,
  status: "ACTIVE",
  tiers: [
    {
      name: "Day 1 Believer",
      priceUsd: 2,
      badge: "Micro-Pledge",
      description: "Proof of concept pledge. Zero-friction solidarity for independent software builders.",
      perks: [
        "Permanent placement on the Protocol100 backer wall",
        "Weekly build telemetry and revenue logs",
        "Dynamic shareable backer badge",
      ],
      sortOrder: 0,
    },
    {
      name: "The Sprint Backer",
      priceUsd: 19,
      featured: true,
      badge: "Most Popular",
      description: "Direct lifetime access to the Protocol100 execution app and 100-day checklist.",
      perks: [
        "Protocol100 web app lifetime access",
        "Complete 100-day prompt and checklist framework",
        "Private Discord accountability community",
        "Weekly live demo access",
      ],
      sortOrder: 1,
    },
    {
      name: "The Sovereign Stack",
      priceUsd: 49,
      badge: "Bundle",
      description: "The complete one-person business stack: Protocol100 + Solopreneur OS.",
      perks: [
        "All Sprint Backer deliverables",
        "Solopreneur OS lifetime license",
        "Production Next.js boilerplate templates",
      ],
      sortOrder: 2,
    },
    {
      name: "The Indie Founder Bundle",
      priceUsd: 99,
      badge: "All-in-One",
      description: "The full toolchain: Protocol100 + Solopreneur OS + devIDE cloud environment.",
      perks: [
        "All Sovereign Stack perks",
        "devIDE lifetime access",
        "Featured project profile in the community showcase",
      ],
      sortOrder: 3,
    },
    {
      name: "Founding Patron",
      priceUsd: 250,
      badge: "Limited (10)",
      description: "Direct access and permanent recognition as a foundational sponsor.",
      perks: [
        "All Indie Founder perks",
        "60-minute 1-on-1 architecture teardown",
        "Permanent logo and link in the Protocol100 footer",
      ],
      limit: 10,
      sortOrder: 4,
    },
  ],
  phases: [
    {
      label: "Days 1–25",
      title: "Validation and core architecture",
      description:
        "Establish zero-fluff core logic, Prisma contracts, authentication, and a continuous deployment pipeline.",
    },
    {
      label: "Days 26–50",
      title: "The minimum lovable product",
      description:
        "Build out the single core execution loop. No unnecessary feature creep or premature optimization.",
    },
    {
      label: "Days 51–75",
      title: "Payment rails and distribution",
      description:
        "Embed Stripe billing, backer webhooks, and launch distribution channels in builder hubs.",
    },
    {
      label: "Days 76–100",
      title: "Public launch and first revenue",
      description:
        "Open access to public cohorts, initiate live onboarding calls, and secure the first monetized users.",
    },
  ],
  faqs: [
    {
      question: "Why back for just $2? Does that actually help?",
      answer:
        "Yes. Crowdfunding momentum relies on velocity and social proof. When hundreds of backers pledge $2, it proves real demand and triggers visibility across creator communities.",
    },
    {
      question: "When do I get access to Protocol100?",
      answer:
        "Backers get instant access to the private community and weekly telemetry updates. Software access unlocks progressively throughout the 100-day build sprint.",
    },
    {
      question: "What is the relationship between Protocol100 and Crowdventure?",
      answer:
        "Protocol100 is a campaign running on Crowdventure. It lives at the protocol subdomain, on the protocol100 slug. Every other builder gets the same template with their own data.",
    },
    {
      question: "What if you don't hit the funding target?",
      answer:
        "The sprint happens regardless. The code is being written every day. Backing accelerates tooling runway, domain infrastructure, and open platform features.",
    },
  ],
  backers: [
    { name: "Alex Rivera", handle: "arivera_dev", email: "alex@example.com", amountUsd: 19, message: "Rooting for this. Kill the VC bloat.", tierIndex: 1 },
    { name: "Elena Rostova", handle: "erostova", email: "elena@example.com", amountUsd: 49, message: "Solopreneur OS is exactly what I needed.", tierIndex: 2 },
    { name: "Marcus Chen", handle: "mchen_builds", email: "marcus@example.com", amountUsd: 2, message: "$2 well spent. Let's see Day 100.", tierIndex: 0 },
    { name: "Sarah Jenkins", handle: "sjenkins", email: "sarah@example.com", amountUsd: 99, message: "Full bundle. Ready for the ride.", tierIndex: 3 },
    { name: "Tariq Vance", handle: "tvance_code", email: "tariq@example.com", amountUsd: 2, message: "Solo builders unite.", tierIndex: 0 },
    { name: "Kenji Sato", handle: "kenjisato", email: "kenji@example.com", amountUsd: 19, message: "Ship it.", tierIndex: 1 },
  ],
};

const fieldNotes: ProjectSeed = {
  slug: "field-notes",
  title: "Field Notes",
  tagline: "A weekly public lab notebook for the experiments that do not fit inside the 100-day sprint.",
  eyebrow: "SECOND PROJECT · SAME CREATOR",
  statusLabel: "OPEN NOTES",
  manifestoTitle: "The sprint is one build. The notes are the rest.",
  story:
    "Protocol100 is the campaign with a deadline. Field Notes is the quieter project on the same subdomain: essays, failed prototypes, and the tools that fall out of the sprint.\n\nSame page template. Different goal, different pledge levels, different backers.",
  endsAt: endsIn(60),
  targetGoal: 1200,
  totalRaised: 80,
  backerCount: 2,
  status: "ACTIVE",
  tiers: [
    {
      name: "Reader",
      priceUsd: 5,
      description: "Get the notes as they ship.",
      perks: ["Weekly note by email"],
      sortOrder: 0,
    },
    {
      name: "Studio seat",
      priceUsd: 40,
      featured: true,
      badge: "Popular",
      description: "Read the notes and keep the source files.",
      perks: ["Weekly note", "Source files for each experiment"],
      sortOrder: 1,
    },
  ],
  phases: [
    {
      label: "Now",
      title: "Publish the first twelve notes",
      description: "One note a week, each tied to a working prototype.",
    },
  ],
  faqs: [
    {
      question: "Is this the same campaign as Protocol100?",
      answer: "No. It is a second project on the protocol subdomain, at /field-notes.",
    },
  ],
  backers: [
    { name: "Noah Pell", email: "noah@example.com", amountUsd: 40, message: "Send the source.", tierIndex: 1 },
    { name: "Imani Cole", email: "imani@example.com", amountUsd: 40, message: "Taking a studio seat.", tierIndex: 1 },
  ],
};

const harbor: ProjectSeed = {
  slug: "harbor",
  title: "Harbor",
  tagline: "A quiet desk for freelance engineers who want retainers instead of another marketplace profile.",
  eyebrow: "INDEPENDENT PRACTICE",
  statusLabel: "ACCEPTING FOUNDING CLIENTS",
  manifestoTitle: "A practice, not a platform pitch.",
  story:
    "Harbor is Lane Okonkwo's campaign. It uses the same project template as Protocol100, with a different creator, subdomain, story, and pledge ladder.\n\nOpen lane.crowdventure.quest/harbor and you are on this project. Open the subdomain root and you see every project Lane is running.",
  endsAt: endsIn(45),
  targetGoal: 8000,
  totalRaised: 2400,
  backerCount: 3,
  status: "ACTIVE",
  tiers: [
    {
      name: "Signal",
      priceUsd: 25,
      description: "A public vote that this practice should exist.",
      perks: ["Name on the Harbor backer wall"],
      sortOrder: 0,
    },
    {
      name: "Office hours",
      priceUsd: 150,
      featured: true,
      badge: "Working session",
      description: "One hour on your current build.",
      perks: ["60-minute working session", "Written follow-up"],
      sortOrder: 1,
    },
    {
      name: "Retainer seat",
      priceUsd: 900,
      badge: "Limited (4)",
      description: "A month of reserved build time.",
      perks: ["Four working sessions", "Shared board"],
      limit: 4,
      sortOrder: 2,
    },
  ],
  faqs: [
    {
      question: "Why is Harbor on a different subdomain?",
      answer: "Each builder owns a subdomain. Harbor belongs to Lane, so it lives at lane/harbor, not under Protocol.",
    },
  ],
  backers: [
    { name: "Mira Solano", handle: "mirasolano", email: "mira@example.com", amountUsd: 150, message: "Booking the working session.", tierIndex: 1 },
    { name: "Jon Abebe", email: "jon@example.com", amountUsd: 25, message: "A signal that this should exist.", tierIndex: 0 },
    { name: "Priya Raman", handle: "priyar", email: "priya@example.com", amountUsd: 900, message: "Holding a retainer seat.", tierIndex: 2 },
  ],
};

async function upsertCreator(input: {
  email: string;
  name: string;
  subdomain: string;
  headline: string;
  bio: string;
}) {
  return prisma.user.upsert({
    where: { subdomain: input.subdomain },
    update: {
      name: input.name,
      headline: input.headline,
      bio: input.bio,
    },
    create: input,
  });
}

async function upsertProject(creatorId: string, project: ProjectSeed) {
  const campaign = await prisma.campaign.upsert({
    where: { creatorId_slug: { creatorId, slug: project.slug } },
    update: {
      title: project.title,
      tagline: project.tagline,
      story: project.story,
      eyebrow: project.eyebrow,
      statusLabel: project.statusLabel,
      manifestoTitle: project.manifestoTitle,
      manifestoQuote: project.manifestoQuote,
      endsAt: project.endsAt,
      targetGoal: project.targetGoal,
      totalRaised: project.totalRaised,
      backerCount: project.backerCount,
      status: project.status,
    },
    create: {
      creatorId,
      slug: project.slug,
      title: project.title,
      tagline: project.tagline,
      story: project.story,
      eyebrow: project.eyebrow,
      statusLabel: project.statusLabel,
      manifestoTitle: project.manifestoTitle,
      manifestoQuote: project.manifestoQuote,
      endsAt: project.endsAt,
      targetGoal: project.targetGoal,
      totalRaised: project.totalRaised,
      backerCount: project.backerCount,
      status: project.status,
    },
  });

  await prisma.phase.deleteMany({ where: { campaignId: campaign.id } });
  await prisma.faq.deleteMany({ where: { campaignId: campaign.id } });

  if (project.phases?.length) {
    await prisma.phase.createMany({
      data: project.phases.map((phase, index) => ({
        campaignId: campaign.id,
        label: phase.label,
        title: phase.title,
        description: phase.description,
        sortOrder: index,
      })),
    });
  }

  if (project.faqs?.length) {
    await prisma.faq.createMany({
      data: project.faqs.map((faq, index) => ({
        campaignId: campaign.id,
        question: faq.question,
        answer: faq.answer,
        sortOrder: index,
      })),
    });
  }

  const existingTiers = await prisma.tier.count({ where: { campaignId: campaign.id } });
  if (existingTiers > 0) return;

  const tiers = [];
  for (const tier of project.tiers) {
    tiers.push(
      await prisma.tier.create({
        data: {
          campaignId: campaign.id,
          name: tier.name,
          priceUsd: tier.priceUsd,
          description: tier.description,
          perks: tier.perks,
          badge: tier.badge,
          featured: tier.featured ?? false,
          limit: tier.limit,
          sortOrder: tier.sortOrder,
        },
      })
    );
  }

  for (const backer of project.backers ?? []) {
    const tier = tiers[backer.tierIndex];
    if (!tier) continue;
    await prisma.backer.create({
      data: {
        campaignId: campaign.id,
        tierId: tier.id,
        email: backer.email,
        name: backer.name,
        handle: backer.handle,
        message: backer.message,
        amountUsd: backer.amountUsd,
        status: "SUCCEEDED",
      },
    });
  }
}

async function main() {
  const protocol = await upsertCreator({
    email: "protocol@crowdventure.quest",
    name: "Protocol",
    subdomain: "protocol",
    headline: "One builder. Two projects. Both in public.",
    bio: "This subdomain belongs to Protocol. Protocol100 is the 100-day sprint. Field Notes is the second project, on its own slug, using the same campaign template.",
  });

  const lane = await upsertCreator({
    email: "lane@crowdventure.quest",
    name: "Lane Okonkwo",
    subdomain: "lane",
    headline: "A practice for engineers who want retainers.",
    bio: "Lane's home lists every project under this subdomain. Harbor is the live one.",
  });

  await upsertProject(protocol.id, protocol100);
  await upsertProject(protocol.id, fieldNotes);
  await upsertProject(lane.id, harbor);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
