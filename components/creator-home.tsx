import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";
import ClaimSubdomainPrompt from "@/components/claim-subdomain-prompt";
import NewProjectForm from "@/components/new-project-form";
import { ReconcileTool } from "@/components/reconcile-tool";
import { EmailConfirmation, PayoutSetup } from "@/components/studio-account-tools";
import PitchRefiner from "@/components/pitch-refiner";
import type { CreatorHomeData } from "@/lib/landing-types";
import { platformFeeCents } from "@/lib/platform-fee";

const STATUS_LABEL = {
  DRAFT: "Draft",
  ACTIVE: "Live",
  COMPLETED: "Funded",
  PAUSED: "Paused",
} as const;

export default function CreatorHome({
  creator,
  signedIn = false,
  platformAdmin = false,
}: {
  creator: CreatorHomeData;
  signedIn?: boolean;
  platformAdmin?: boolean;
}) {
  const raised = creator.projects.reduce((sum, project) => sum + project.totalRaised, 0);
  const backers = creator.projects.reduce((sum, project) => sum + project.backerCount, 0);
  const featured = creator.projects.find((project) => project.status === "ACTIVE") ?? creator.projects[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-sm font-bold text-white truncate">{creator.name}</div>
              <div className="text-[10px] font-mono text-slate-500 truncate">
                {creator.subdomain ?? "No subdomain yet"}
              </div>
            </div>
          </div>
          <a
            href={creator.platformHref}
            className="text-xs font-mono text-slate-400 hover:text-emerald-400 transition"
          >
            Crowdventure
          </a>
        </div>
      </header>

      <section className="px-6 pt-16 pb-12 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-10 items-end">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-4">
              {signedIn ? "Studio" : "Creator home"}
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {creator.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">{creator.bio}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Projects" value={String(creator.projects.length)} />
            <Stat label="Raised" value={`$${raised.toLocaleString()}`} />
            <Stat label="Backers" value={backers.toLocaleString()} />
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-6xl mx-auto">
        {!creator.subdomain && creator.projects.length > 0 && (
          <ClaimSubdomainPrompt projectCount={creator.projects.length} />
        )}
        {creator.projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center">
            <h2 className="text-2xl font-bold text-white">No projects published yet</h2>
            <p className="mt-3 text-sm text-slate-400">
              Publish the first campaign below. It will show up here at{" "}
              <span className="font-mono text-emerald-400">{creator.subdomain}/your-slug</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {featured && (
              <ProjectCard
                href={signedIn ? `/account/${featured.slug}` : featured.href}
                liveHref={signedIn ? featured.href : undefined}
                className="group block rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-8 sm:p-10 hover:border-emerald-400/60 transition"
              >
                <div className="flex items-center justify-between gap-4 text-xs font-mono text-emerald-400">
                  <span>{signedIn ? "OPEN STUDIO" : "FEATURED"} · {STATUS_LABEL[featured.status].toUpperCase()}</span>
                  <span className="inline-flex items-center gap-1">
                    {creator.subdomain ? `${creator.subdomain}/${featured.slug}` : "Unlisted"}
                    {featured.href && <ArrowUpRight className="w-3.5 h-3.5" />}
                  </span>
                </div>
                <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white group-hover:text-emerald-100 transition">
                  {featured.title}
                </h2>
                <p className="mt-4 max-w-2xl text-slate-400">{featured.tagline}</p>
                <Progress
                  raised={featured.totalRaised}
                  goal={featured.targetGoal}
                  backers={featured.backerCount}
                />
              </ProjectCard>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {creator.projects
                .filter((project) => project.slug !== featured?.slug)
                .map((project) => (
                  <ProjectCard
                    key={project.slug}
                    href={signedIn ? `/account/${project.slug}` : project.href}
                    liveHref={signedIn ? project.href : undefined}
                    className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{STATUS_LABEL[project.status]}</span>
                      <span>
                        {creator.subdomain ? `${creator.subdomain}/${project.slug}` : "Unlisted"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-white">{project.title}</h3>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-3">{project.tagline}</p>
                    <Progress
                      raised={project.totalRaised}
                      goal={project.targetGoal}
                      backers={project.backerCount}
                    />
                  </ProjectCard>
                ))}
            </div>
          </div>
        )}

        {signedIn && creator.pledgesMade && creator.pledgesMade.length > 0 && (
          <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-bold text-white">Pledges you made</h2>
            <ul className="mt-4 divide-y divide-slate-800">
              {creator.pledgesMade.map((pledge) => (
                <li key={pledge.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <div className="font-semibold text-white">{pledge.projectTitle}</div>
                    <div className="text-xs text-slate-500">
                      {pledge.name} · {new Date(pledge.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-white">${pledge.amountUsd.toLocaleString()}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      fee ${(pledge.platformFeeCents / 100).toFixed(2)} · {pledge.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {signedIn && creator.recentPledges && creator.recentPledges.length > 0 && (
          <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-bold text-white">Pledges on your projects</h2>
            <ul className="mt-4 divide-y divide-slate-800">
              {creator.recentPledges.map((pledge) => (
                <li key={pledge.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <div className="font-semibold text-white">{pledge.name}</div>
                    <div className="text-xs text-slate-500">
                      {pledge.projectTitle} · {new Date(pledge.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-white">${pledge.amountUsd.toLocaleString()}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      fee ${(pledge.platformFeeCents / 100).toFixed(2)} · {pledge.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {signedIn && (
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <PayoutSetup connected={Boolean(creator.payoutsConnected)} />
            <EmailConfirmation email={creator.email} verified={Boolean(creator.emailVerified)} />
            {creator.subdomain && (
              <ReconcileTool
                scope="studio"
                title={`Reconcile ${creator.subdomain}`}
                detail="Check this subdomain's pledges against Stripe. Paid sessions that the webhook missed are recorded, and the project totals are set to the confirmed pledges."
              />
            )}
            {platformAdmin && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-lg font-bold text-white">Platform reconcile</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Compare every studio with Stripe, not only this subdomain.
                </p>
                <Link
                  href="/account/reconcile"
                  className="mt-4 inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:border-emerald-500"
                >
                  Open platform reconcile
                </Link>
                <Link
                  href="/admin/waitlist"
                  className="mt-3 inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:border-emerald-500"
                >
                  Review beta waitlist
                </Link>
              </div>
            )}
            <NewProjectForm
              subdomain={creator.subdomain ?? ""}
              pathPrefix={creator.projectPathPrefix}
              signedIn
            />
            <PitchRefiner
              initialTitle={featured?.title}
              initialTagline={featured?.tagline}
              initialGoal={featured?.targetGoal}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectCard({
  href,
  liveHref,
  className,
  children,
}: {
  href: string;
  liveHref?: string;
  className: string;
  children: ReactNode;
}) {
  if (!liveHref) {
    if (!href) return <div className={className}>{children}</div>;
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <div className={`${className} relative`}>
      <Link href={href} className="absolute inset-0 rounded-[inherit]" aria-label="Open studio" />
      <div className="pointer-events-none">{children}</div>
      <Link
        href={liveHref}
        className="relative z-10 mt-4 inline-flex items-center gap-1 text-xs font-mono text-emerald-400 hover:underline"
      >
        View live page <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-bold font-mono text-white">{value}</div>
    </div>
  );
}

function Progress({
  raised,
  goal,
  backers,
}: {
  raised: number;
  goal: number;
  backers: number;
}) {
  const percent = Math.min(100, Math.round((raised / Math.max(goal, 1)) * 100));
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-baseline justify-between text-xs font-mono text-slate-400">
        <span>
          <span className="text-white">${raised.toLocaleString()}</span> of ${goal.toLocaleString()}
        </span>
        <span>
          {backers} backers · fee ${(platformFeeCents(raised) / 100).toFixed(2)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
