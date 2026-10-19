import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Lock, ShieldCheck, Users, Zap } from "lucide-react";
import AccountAuthForm from "@/components/account-auth-form";
import { LandingShot } from "@/components/landing-shot";
import type { PlatformProjectCard } from "@/lib/landing-types";

export default function MarketingHome({
  projects,
  signedIn,
}: {
  projects: PlatformProjectCard[];
  signedIn: boolean;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern">
      <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Zap className="h-4 w-4" fill="currentColor" />
            </span>
            CROWDVENTURE
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <a href="#how-it-works" className="hidden hover:text-emerald-300 sm:inline">
              How it Works
            </a>
            <a href="#for-creators" className="hidden hover:text-emerald-300 md:inline">
              For Creators
            </a>
            <a href="#features" className="hidden hover:text-emerald-300 lg:inline">
              Features
            </a>
            {signedIn ? (
              <Link
                href="/account"
                className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Your home
              </Link>
            ) : (
              <>
                <a href="#login" className="hover:text-emerald-300">
                  Log In
                </a>
                <a
                  href="#join"
                  className="rounded-lg bg-emerald-500 px-3.5 py-1.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      <header className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center">
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl">
          Back Independence.
          <span className="mt-2 block bg-linear-to-r from-emerald-300 to-teal-100 bg-clip-text text-transparent">
            Fuel Direct Innovation.
          </span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400">
          CrowdVenture connects software craftspeople with forward-thinking patrons. Back verified
          solopreneurs, track live build metrics, and unlock insider access to tools before they hit
          the mainstream.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#explore"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Explore Projects <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={signedIn ? "/account" : "#launch"}
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-500/50 hover:text-emerald-300"
          >
            Launch as a Creator
          </a>
        </div>
        <div className="mx-auto mt-14 max-w-5xl text-left">
          <LandingShot
            src="/marketing/hero-dashboard.jpg"
            alt="A CrowdVenture studio dashboard with commit history, milestone progress, funding trends, and the backer ledger."
            priority
          />
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-slate-800 pt-8 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Zero Equity Dilution
          </span>
          <span className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" /> Direct Payouts via Stripe
          </span>
          <span className="inline-flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-400" /> Verified Milestone Changelogs
          </span>
        </div>
      </header>

      <section id="how-it-works" className="border-y border-slate-900 bg-slate-950/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              Partnership, Not Charity
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-white">
              Built for those who create and those who see the future.
            </h2>
          </div>
          <div className="mb-12">
            <LandingShot
              src="/marketing/breakthrough.jpg"
              alt="A green launch breaking through a dark maze, carrying a rocket, code, and a lightbulb."
            />
          </div>
          <div id="features" className="grid scroll-mt-24 gap-4 md:grid-cols-3">
            <Feature
              icon={<Users className="h-4 w-4" />}
              title="Direct Access & Influence"
              body="Traditional software hides behind support desks. Your backing grants direct channel access to the solo founder, feature-request priority, and early design reviews."
            />
            <Feature
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Lifetime Asymmetric Utility"
              body="Early patrons receive permanent software perks: locked-in micro-pricing, early release candidate testing, and API quotas that compound in value as the product matures."
            />
            <Feature
              icon={<Globe className="h-4 w-4" />}
              title="Radical Build Visibility"
              body="No vaporware. Creators publish live commits, sprint milestones, and public roadmaps on their custom project subdomains. You observe precisely where every sprint moves."
            />
          </div>
        </div>
      </section>

      <section id="for-creators" className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">For Solo Developers</p>
          <h2 className="mt-3 text-5xl font-extrabold leading-[1.05] tracking-tight text-white">
            Build Products,
            <span className="mt-2 block">Not Pitch Decks.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            Skip institutional gatekeepers and predatory cap tables. CrowdVenture gives solopreneurs
            a dedicated micro-patronage subdomain powered by Stripe. Secure recurring operational
            runway directly from users who need what you build.
          </p>
          <div className="mt-8 space-y-6">
            <Pitch title="Dedicated Subdomains" body="yourproject.crowdventure.quest" />
            <Pitch
              title="Native Stripe Connect"
              body="Funds deposit straight to your linked account."
            />
            <Pitch
              title="Milestone-Driven"
              body="Release updates tied directly to your development roadmap."
              last
            />
          </div>
          <a
            href={signedIn ? "/account" : "#start-subdomain"}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Start Your Project Subdomain <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <LandingShot
          src="/marketing/builder-desk.jpg"
          alt="A maker's desk with code on one screen and the CrowdVenture studio on the other."
        />
      </section>

      <section id="explore" className="mx-auto max-w-6xl px-6 pb-8">
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Live now</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Explore Projects</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            Back verified solopreneurs and track the build in public. Each card is a live campaign
            on that creator&apos;s subdomain.
          </p>
        </div>
        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-sm text-slate-400">
            No live projects yet. Launch as a creator and the first subdomain will show up here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const percent = Math.min(
                100,
                Math.round((project.totalRaised / Math.max(project.targetGoal, 1)) * 100)
              );
              return (
                <a
                  key={`${project.subdomain}/${project.slug}`}
                  href={project.href}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-emerald-500/40"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
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
                  <div className="mt-2 flex justify-between text-xs font-mono text-slate-500">
                    <span>${project.totalRaised.toLocaleString()} raised</span>
                    <span>{project.backerCount} backers</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {signedIn ? (
        <section id="join" className="px-6 py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">You are signed in</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Your studio is ready.</h2>
            <Link
              href="/account"
              className="mt-6 inline-flex rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              Open your home
            </Link>
          </div>
        </section>
      ) : (
        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2">
            <div id="join" className="scroll-mt-24">
              <div id="launch" className="scroll-mt-24">
                <div id="start-subdomain" className="scroll-mt-24">
                  <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Get Started</p>
                  <h2 className="mt-2 text-4xl font-extrabold text-white">Start Your Project Subdomain.</h2>
                  <p className="mt-4 leading-relaxed text-slate-400">
                    Create the account and claim the name together. Patrons then find the build at
                    yourproject.crowdventure.quest, with each campaign on its own slug.
                  </p>
                  <AccountAuthForm initialMode="sign-up" redirectTo="/account" />
                </div>
              </div>
            </div>
            <div id="login" className="scroll-mt-24">
              <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Log In</p>
              <h2 className="mt-2 text-4xl font-extrabold text-white">Return to your studio.</h2>
              <p className="mt-4 leading-relaxed text-slate-400">
                Sign in with the email on the account. Your home lists every project under the
                subdomain you claimed.
              </p>
              <AccountAuthForm initialMode="sign-in" redirectTo="/account" />
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}

function Pitch({ title, body, last = false }: { title: string; body: string; last?: boolean }) {
  return (
    <div className={last ? "" : "border-b border-slate-800 pb-8"}>
      <div className="font-semibold text-white">{title}</div>
      <div className="mt-1 font-mono text-sm text-slate-400">{body}</div>
    </div>
  );
}
