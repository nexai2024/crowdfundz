import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers3, Radio, WalletCards } from "lucide-react";
import ClaimSubdomainForm from "@/components/claim-subdomain-form";
import type { PlatformProjectCard } from "@/lib/landing-types";

export default function PlatformHome({ projects }: { projects: PlatformProjectCard[] }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-mono text-sm font-bold tracking-tight text-white">
            CROWDVENTURE
          </Link>
          <a
            href="#claim"
            className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Claim a subdomain
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <p className="mb-5 text-xs font-mono uppercase tracking-[0.2em] text-emerald-400">
          A front door for every independent build
        </p>
        <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl">
          Your name on the subdomain.
          <span className="mt-2 block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-100">
            Your project on the slug.
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-400">
          Crowdventure gives each builder a home, then a campaign page for every thing they are
          shipping. The layout stays the same. The story, pledges, and backer wall come from that
          project.
        </p>

        <ProjectSpecimen project={projects[0]} />
      </section>

      <section className="border-y border-slate-900 bg-slate-950/50 px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <Feature
            icon={<Radio className="h-4 w-4" />}
            title="Subdomain home"
            body="protocol.crowdventure.quest is the builder. It lists every project they are running, with the live one featured."
          />
          <Feature
            icon={<Layers3 className="h-4 w-4" />}
            title="Project slug"
            body="/protocol100 is one campaign. Another build by the same person lives at the next slug, on the same template."
          />
          <Feature
            icon={<WalletCards className="h-4 w-4" />}
            title="Pledge levels that belong to the project"
            body="Tiers, the backer wall, the roadmap, and the FAQ are records on that campaign, not copy baked into the homepage."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Live now</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Campaigns already on the template</h2>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-sm text-slate-400">
            No live campaigns yet. Claim a subdomain and the first project page will show up here.
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
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      {project.subdomain}/{project.slug}
                      <ArrowUpRight className="h-3.5 w-3.5" />
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
                  <div className="mt-4 text-xs font-mono text-slate-500">
                    Builder home:{" "}
                    <span className="text-slate-300">{project.creatorHref.replace(/^https?:\/\//, "")}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <section id="claim" className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Start</p>
            <h2 className="mt-2 text-4xl font-extrabold text-white">Claim the name, then publish the slug.</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              The subdomain is yours. Each project you launch gets its own path under it, rendered
              by the same campaign template Protocol100 uses.
            </p>
          </div>
          <ClaimSubdomainForm />
        </div>
      </section>
    </div>
  );
}

function ProjectSpecimen({ project }: { project?: PlatformProjectCard }) {
  const title = project?.title ?? "Protocol100";
  const subdomain = project?.subdomain ?? "protocol";
  const slug = project?.slug ?? "protocol100";
  const raised = project?.totalRaised ?? 0;
  const goal = project?.targetGoal ?? 5000;
  const backers = project?.backerCount ?? 0;
  const percent = Math.min(100, Math.round((raised / Math.max(goal, 1)) * 100));

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 truncate font-mono text-xs text-slate-400">
          {subdomain}.crowdventure.quest/{slug}
        </span>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-[1.4fr_0.8fr] sm:p-8">
        <div>
          <div className="text-xs font-mono text-emerald-400">LIVE PROJECT TEMPLATE</div>
          <div className="mt-2 text-2xl font-bold text-white">{title}</div>
          <p className="mt-2 text-sm text-slate-400">
            {project?.tagline ??
              "The same page any campaign uses, filled with that project's goal, tiers, and backers."}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="font-mono text-2xl font-bold text-white">${raised.toLocaleString()}</div>
          <div className="mt-1 text-xs font-mono text-slate-500">
            of ${goal.toLocaleString()} · {backers} backers
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
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
