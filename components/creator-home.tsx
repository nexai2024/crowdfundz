import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";
import NewProjectForm from "@/components/new-project-form";
import type { CreatorHomeData } from "@/lib/landing-types";

const STATUS_LABEL = {
  DRAFT: "Draft",
  ACTIVE: "Live",
  COMPLETED: "Funded",
  PAUSED: "Paused",
} as const;

export default function CreatorHome({ creator }: { creator: CreatorHomeData }) {
  const raised = creator.projects.reduce((sum, project) => sum + project.totalRaised, 0);
  const backers = creator.projects.reduce((sum, project) => sum + project.backerCount, 0);
  const featured = creator.projects.find((project) => project.status === "ACTIVE") ?? creator.projects[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-sm font-bold text-white truncate">{creator.name}</div>
              <div className="text-[10px] font-mono text-slate-500 truncate">{creator.subdomain}</div>
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
              Creator home
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
              <Link
                href={featured.href}
                className="group block rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-8 sm:p-10 hover:border-emerald-400/60 transition"
              >
                <div className="flex items-center justify-between gap-4 text-xs font-mono text-emerald-400">
                  <span>FEATURED · {STATUS_LABEL[featured.status].toUpperCase()}</span>
                  <span className="inline-flex items-center gap-1">
                    {creator.subdomain}/{featured.slug}
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
              </Link>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {creator.projects
                .filter((project) => project.slug !== featured?.slug)
                .map((project) => (
                  <Link
                    key={project.slug}
                    href={project.href}
                    className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{STATUS_LABEL[project.status]}</span>
                      <span>
                        {creator.subdomain}/{project.slug}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-white">{project.title}</h3>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-3">{project.tagline}</p>
                    <Progress
                      raised={project.totalRaised}
                      goal={project.targetGoal}
                      backers={project.backerCount}
                    />
                  </Link>
                ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <NewProjectForm subdomain={creator.subdomain} pathPrefix={creator.projectPathPrefix} />
        </div>
      </section>
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
        <span>{backers} backers</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
