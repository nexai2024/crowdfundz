import Link from "next/link";
import {
  ArrowRight,
  GitCommitHorizontal,
  Lock,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { LandingShot } from "@/components/landing-shot";
import WaitlistForm from "@/components/waitlist-form";
import { getPlatformProjects } from "@/lib/campaigns";
import type { PlatformProjectCard } from "@/lib/landing-types";

export default async function WaitlistLanding() {
  let projects: PlatformProjectCard[] = [];
  try {
    projects = await getPlatformProjects();
  } catch (error) {
    console.error("WaitlistLanding: could not load live campaigns", error);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern">
      <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/waitlist" className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Zap className="h-4 w-4" fill="currentColor" />
            </span>
            CROWDVENTURE
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <a href="#model" className="hidden hover:text-emerald-300 sm:inline">
              The model
            </a>
            <a href="#patrons" className="hidden hover:text-emerald-300 md:inline">
              Patrons
            </a>
            <a href="#builders" className="hidden hover:text-emerald-300 lg:inline">
              Builders
            </a>
            <Link href="/account" className="hover:text-emerald-300">
              Sign in
            </Link>
            <a
              href="#join"
              className="rounded-lg bg-emerald-500 px-3.5 py-1.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Request a spot
            </a>
          </div>
        </div>
      </nav>

      <header className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:pt-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">Open beta · micro-patronage for software</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl">
            Back independence.
            <span className="mt-2 block bg-linear-to-r from-emerald-300 to-teal-100 bg-clip-text text-transparent">
              Fund the build you can see.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            CrowdVenture is where a solo software maker raises runway from the people who want the product.
            No equity. No pitch deck. A public studio, a Stripe checkout, and pledges that can wait until the work ships.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#join"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              Request a beta spot <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#model"
              className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-500/50 hover:text-emerald-300"
            >
              See how a campaign works
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Not an investment
            </li>
            <li className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" /> Stripe Connect payouts
            </li>
            <li className="inline-flex items-center gap-2">
              <GitCommitHorizontal className="h-4 w-4 text-emerald-400" /> Money can follow the merge
            </li>
          </ul>
        </div>
        <LandingShot
          src="/marketing/hero-dashboard.jpg"
          alt="A CrowdVenture studio dashboard with commit history, milestone progress, funding trends, and the backer ledger."
          priority
        />
      </header>

      <section className="border-y border-slate-900 bg-slate-950/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">Why this exists</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white">
            A trailer goes quiet. A funding round takes the company. A studio stays in public.
          </h2>
          <div className="mt-10">
            <LandingShot
              src="/marketing/breakthrough.jpg"
              alt="A green launch breaking through a dark maze, carrying a rocket, code, and a lightbulb."
            />
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Contrast
              kicker="The trailer"
              title="Back the video."
              body="A goal, a promise, then months of updates that may never name the commit. You paid for a future you cannot inspect."
            />
            <Contrast
              kicker="The round"
              title="Sell the company early."
              body="A deck, a valuation, a slice of ownership gone before the product has users. The maker spends the year fundraising instead of shipping."
            />
            <Contrast
              kicker="The studio"
              title="Fund the person building it."
              body="A subdomain, the story, the pledge levels, and the work itself. You pay for access and proximity. You do not buy a share of the company."
              accent
            />
          </div>
        </div>
      </section>

      <section id="model" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">The model</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              A pledge can clear today, or wait for the phase to ship.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              Every project lives at a creator subdomain, then a slug for the campaign. The page is the product:
              the story, the tiers, the backer wall, and the roadmap. Patrons choose instant funding, or split a
              pledge across phases. Held amounts stay put until that phase is signed off.
            </p>
            <ol className="mt-8 space-y-5">
              <Step
                n="01"
                title="The maker claims a name."
                body="yourname.crowdventure.quest is the studio. Each campaign is its own page, with a goal, a story, and pledge levels."
              />
              <Step
                n="02"
                title="A patron picks a tier."
                body="Checkout runs through Stripe. The receipt is for access, early software, or sponsorship — not equity, not a return, not a donation."
              />
              <Step
                n="03"
                title="The build stays visible."
                body="Commits, phase notes, a sandbox, and a backer wall sit on the same page. When a phase is done, held funds can be released."
              />
            </ol>
          </div>
          <div className="space-y-6">
            <LandingShot
              src="/marketing/builder-desk.jpg"
              alt="A maker's desk with code on one screen and the CrowdVenture studio on the other."
            />
            <PhaseBoard />
          </div>
        </div>
      </section>

      <section id="patrons" className="border-y border-slate-900 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <Audience
            id="patrons-card"
            eyebrow="For patrons"
            title="You are buying a seat next to the work."
            body="Early patrons get the thing before it is mainstream: a direct line to the founder, feature priority, locked-in pricing, and a sandbox of the build. Polls on the campaign let backers weigh in. None of that is a share certificate."
            points={[
              "See commits and phase notes on the project page",
              "Try the product in a sandbox before the public launch",
              "Hold part of a pledge until a phase is signed off",
            ]}
          />
          <Audience
            id="builders"
            eyebrow="For builders"
            title="The work is the pitch."
            body="Skip the gatekeepers. Claim a subdomain, write the story, set the tiers, and connect Stripe. Payouts go to the linked account. The studio holds the roadmap, tasks, bounties, and sponsor slots beside the campaign people actually read."
            points={[
              "A public home at yourname.crowdventure.quest",
              "Instant pledges or milestone holds, per backer",
              "A studio for the build, not a second pitch deck",
            ]}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">Already in public</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Studios on the platform</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              These campaigns are live. New studios are entering in batches, which is why the front door is a list.
            </p>
          </div>
          <a href="#join" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
            Ask for a spot
          </a>
        </div>
        {projects.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-slate-800 p-10 text-sm text-slate-400">
            The first public studios are being prepared. Join the list and we&apos;ll write when a page is open to back or to launch.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const percent = Math.min(100, Math.round((project.totalRaised / Math.max(project.targetGoal, 1)) * 100));
              return (
                <a
                  key={`${project.subdomain}/${project.slug}`}
                  href={project.href}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-emerald-500/40"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                    <span>{project.creatorName}</span>
                    <span className="text-emerald-400">
                      {project.subdomain}/{project.slug}
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-white">{project.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{project.tagline}</p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-xs text-slate-500">
                    <span>${project.totalRaised.toLocaleString()} raised</span>
                    <span>{project.backerCount} backers</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <section id="join" className="scroll-mt-24 border-t border-slate-900 px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">The list</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-white">Tell us who you are. We&apos;ll open the door.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              Self-serve accounts stay closed while the first studios are watched: payments, milestone holds, and the
              public pages. Leave your name. If you build, say what you&apos;re making. If you want to back someone, say
              what you wish existed. The founder reads it.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-slate-500">
              You&apos;ll get a confirmation now. A separate invite arrives when a spot opens, with a link to set a password
              and enter the studio.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

    </div>
  );
}

function PhaseBoard() {
  const phases = [
    { label: "01", title: "Foundation", state: "Released", detail: "The story, the tiers, and the first backers.", done: true },
    { label: "02", title: "The working build", state: "Held", detail: "Pledges assigned here stay put until the phase is signed off.", done: false },
    { label: "03", title: "Open the doors", state: "Ahead", detail: "Public launch, with the sandbox already on the page.", done: false },
  ];
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Example roadmap · not a live raise</p>
      <ol className="mt-6 space-y-0">
        {phases.map((phase, index) => (
          <li key={phase.label} className="grid grid-cols-[auto_1fr] gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[11px] ${
                  phase.done
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-slate-700 bg-slate-950 text-slate-400"
                }`}
              >
                {phase.label}
              </span>
              {index < phases.length - 1 && <span className="w-px flex-1 bg-slate-800" />}
            </div>
            <div className={index < phases.length - 1 ? "pb-6" : ""}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-white">{phase.title}</h3>
                <span className={`font-mono text-[11px] uppercase ${phase.done ? "text-emerald-300" : "text-slate-500"}`}>
                  {phase.state}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{phase.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Contrast({
  kicker,
  title,
  body,
  accent = false,
}: {
  kicker: string;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-6 ${
        accent ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-800 bg-slate-900/40"
      }`}
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">{kicker}</p>
      <h3 className="mt-3 text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
    </article>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="font-mono text-sm text-emerald-400">{n}</span>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">{body}</p>
      </div>
    </li>
  );
}

function Audience({
  id,
  eyebrow,
  title,
  body,
  points,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}) {
  return (
    <article id={id} className="scroll-mt-24 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
      <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">{title}</h2>
      <p className="mt-4 leading-relaxed text-slate-400">{body}</p>
      <ul className="mt-6 space-y-3 text-sm text-slate-300">
        {points.map((point) => (
          <li key={point} className="flex gap-3">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
