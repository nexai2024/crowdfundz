"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Zap } from "lucide-react";
import type { StudioProject, StudioTask } from "@/lib/studio";

const inputClass =
  "w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none";
const buttonClass =
  "rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50";

const TASK_STATUS = {
  TODO: "To do",
  DOING: "Doing",
  DONE: "Done",
} as const;

export default function ProjectStudio({ project }: { project: StudioProject }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/account" className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <span className="min-w-0">
              <span className="block truncate font-mono text-sm font-bold text-white">{project.title}</span>
              <span className="block truncate font-mono text-[10px] text-slate-500">Studio</span>
            </span>
          </Link>
          {project.publicHref && (
            <Link
              href={project.publicHref}
              className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 hover:underline"
            >
              View live page <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Project studio</p>
        <h1 className="mt-3 text-4xl font-extrabold text-white">Design {project.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          The public page shows the story, pledges, milestones, and only the sandboxes, bounties, and sponsors you publish here.
        </p>

        <nav className="mt-8 flex flex-wrap gap-2 text-xs font-mono">
          {[
            ["brief", "Brief"],
            ["pledges", "Pledges"],
            ["plan", "Plan"],
            ["development", "Development"],
            ["publish", "Publish"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="rounded-full border border-slate-800 px-3 py-1 text-slate-300 hover:border-emerald-500/40 hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-8">
          <BriefSection project={project} />
          <PledgeSection project={project} />
          <PlanSection project={project} />
          <DevelopmentSection project={project} />
          <PublishSection project={project} />
        </div>
      </div>
    </div>
  );
}

function BriefSection({ project }: { project: StudioProject }) {
  const save = useStudioSave();
  return (
    <Section id="brief" title="Brief" hint="This is the public story, goal, and status.">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void save.run({
            action: "saveBrief",
            slug: project.slug,
            title: form.get("title"),
            tagline: form.get("tagline"),
            story: form.get("story"),
            targetGoal: form.get("targetGoal"),
            status: form.get("status"),
            eyebrow: form.get("eyebrow"),
            statusLabel: form.get("statusLabel"),
            manifestoTitle: form.get("manifestoTitle"),
            manifestoQuote: form.get("manifestoQuote"),
          });
        }}
      >
        <Field label="Title">
          <input name="title" required maxLength={120} defaultValue={project.title} className={inputClass} />
        </Field>
        <Field label="Tagline">
          <input name="tagline" required maxLength={280} defaultValue={project.tagline} className={inputClass} />
        </Field>
        <Field label="Story">
          <textarea name="story" required maxLength={8000} rows={8} defaultValue={project.story} className={inputClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Goal (USD)">
            <input name="targetGoal" type="number" min={1} required defaultValue={project.targetGoal} className={inputClass} />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={project.status} className={inputClass}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Live</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Funded</option>
            </select>
          </Field>
          <Field label="Eyebrow">
            <input name="eyebrow" maxLength={80} defaultValue={project.eyebrow ?? ""} className={inputClass} />
          </Field>
          <Field label="Status label">
            <input name="statusLabel" maxLength={80} defaultValue={project.statusLabel ?? ""} className={inputClass} />
          </Field>
        </div>
        <Field label="Manifesto title">
          <input name="manifestoTitle" maxLength={160} defaultValue={project.manifestoTitle ?? ""} className={inputClass} />
        </Field>
        <Field label="Manifesto quote">
          <textarea name="manifestoQuote" maxLength={400} rows={3} defaultValue={project.manifestoQuote ?? ""} className={inputClass} />
        </Field>
        <SaveButton pending={save.pending} error={save.error} label="Save brief" />
      </form>
    </Section>
  );
}

function PledgeSection({ project }: { project: StudioProject }) {
  const save = useStudioSave();
  return (
    <Section id="pledges" title="Pledges" hint="Each level is a public pledge card.">
      <RecordList
        empty="No pledge levels yet."
        rows={project.tiers.map((tier) => ({
          id: tier.id,
          title: `${tier.name} · $${tier.priceUsd}`,
          detail: tier.description,
        }))}
        onRemove={(id) => void save.run({ action: "deleteTier", slug: project.slug, id })}
      />
      <form
        className="mt-4 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void save.run(
            {
              action: "addTier",
              slug: project.slug,
              name: form.get("name"),
              priceUsd: form.get("priceUsd"),
              description: form.get("description"),
              perks: form.get("perks"),
            },
            event.currentTarget
          );
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" required className={inputClass} placeholder="Supporter" />
          </Field>
          <Field label="Price (USD)">
            <input name="priceUsd" type="number" min={1} required className={inputClass} placeholder="25" />
          </Field>
        </div>
        <Field label="Description">
          <input name="description" required className={inputClass} placeholder="What this pledge funds" />
        </Field>
        <Field label="Perks, one per line">
          <textarea name="perks" rows={3} className={inputClass} placeholder="Name on the backer wall" />
        </Field>
        <SaveButton pending={save.pending} error={save.error} label="Add pledge" />
      </form>
      <FaqEditor project={project} />
    </Section>
  );
}

function FaqEditor({ project }: { project: StudioProject }) {
  const save = useStudioSave();
  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      <h3 className="text-sm font-bold text-white">Questions</h3>
      <RecordList
        empty="No questions on the public page."
        rows={project.faqs.map((faq) => ({ id: faq.id, title: faq.question, detail: faq.answer }))}
        onRemove={(id) => void save.run({ action: "deleteFaq", slug: project.slug, id })}
      />
      <form
        className="mt-4 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void save.run(
            {
              action: "addFaq",
              slug: project.slug,
              question: form.get("question"),
              answer: form.get("answer"),
            },
            event.currentTarget
          );
        }}
      >
        <Field label="Question">
          <input name="question" required className={inputClass} />
        </Field>
        <Field label="Answer">
          <textarea name="answer" required rows={3} className={inputClass} />
        </Field>
        <SaveButton pending={save.pending} error={save.error} label="Add question" />
      </form>
    </div>
  );
}

function PlanSection({ project }: { project: StudioProject }) {
  const listSave = useStudioSave();
  const milestoneSave = useStudioSave();
  const taskSave = useStudioSave();
  const unassigned = project.tasks.filter((task) => !task.phaseId);
  return (
    <Section id="plan" title="Milestones and tasks" hint="Milestones publish as the public plan. Tasks stay in the studio.">
      {project.milestones.length === 0 && unassigned.length === 0 && (
        <p className="text-sm text-slate-400">Define the first milestone, then attach the work that gets it done.</p>
      )}
      <div className="space-y-4">
        {project.milestones.map((milestone) => (
          <div key={milestone.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">{milestone.label}</div>
                <h3 className="mt-1 font-bold text-white">{milestone.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{milestone.description}</p>
              </div>
              <RemoveButton onClick={() => void listSave.run({ action: "deleteMilestone", slug: project.slug, id: milestone.id })} />
            </div>
            <TaskList
              tasks={project.tasks.filter((task) => task.phaseId === milestone.id)}
              onChange={(id, status) => void listSave.run({ action: "updateTask", slug: project.slug, id, status })}
              onRemove={(id) => void listSave.run({ action: "deleteTask", slug: project.slug, id })}
            />
          </div>
        ))}
        {unassigned.length > 0 && (
          <div className="rounded-2xl border border-slate-800 p-4">
            <h3 className="text-sm font-bold text-white">Unassigned tasks</h3>
            <TaskList
              tasks={unassigned}
              onChange={(id, status) => void listSave.run({ action: "updateTask", slug: project.slug, id, status })}
              onRemove={(id) => void listSave.run({ action: "deleteTask", slug: project.slug, id })}
            />
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void milestoneSave.run(
              {
                action: "addMilestone",
                slug: project.slug,
                label: form.get("label"),
                title: form.get("title"),
                description: form.get("description"),
              },
              event.currentTarget
            );
          }}
        >
          <h3 className="text-sm font-bold text-white">New milestone</h3>
          <Field label="Label">
            <input name="label" required className={inputClass} placeholder="Week 1" />
          </Field>
          <Field label="Title">
            <input name="title" required className={inputClass} placeholder="Ship the first build" />
          </Field>
          <Field label="Description">
            <textarea name="description" required rows={3} className={inputClass} />
          </Field>
          <SaveButton pending={milestoneSave.pending} error={milestoneSave.error} label="Add milestone" />
        </form>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void taskSave.run(
              {
                action: "addTask",
                slug: project.slug,
                title: form.get("title"),
                details: form.get("details"),
                phaseId: form.get("phaseId"),
              },
              event.currentTarget
            );
          }}
        >
          <h3 className="text-sm font-bold text-white">New task</h3>
          <Field label="Title">
            <input name="title" required className={inputClass} placeholder="Connect the repo" />
          </Field>
          <Field label="Details">
            <textarea name="details" rows={3} className={inputClass} />
          </Field>
          <Field label="Milestone">
            <select name="phaseId" className={inputClass} defaultValue="">
              <option value="">Unassigned</option>
              {project.milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.label} · {milestone.title}
                </option>
              ))}
            </select>
          </Field>
          <SaveButton pending={taskSave.pending} error={taskSave.error} label="Add task" />
        </form>
      </div>
    </Section>
  );
}

function TaskList({
  tasks,
  onChange,
  onRemove,
}: {
  tasks: StudioTask[];
  onChange: (id: string, status: StudioTask["status"]) => void;
  onRemove: (id: string) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <ul className="mt-4 space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">{task.title}</div>
            {task.details && <p className="text-xs text-slate-400">{task.details}</p>}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={task.status}
              onChange={(event) => onChange(task.id, event.target.value as StudioTask["status"])}
              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white"
            >
              {Object.entries(TASK_STATUS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <RemoveButton onClick={() => onRemove(task.id)} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DevelopmentSection({ project }: { project: StudioProject }) {
  const save = useStudioSave();
  return (
    <Section id="development" title="Development" hint="Repository, IDE, and Vercel links. Filled links appear on the public page.">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void save.run({
            action: "saveDev",
            slug: project.slug,
            repoUrl: form.get("repoUrl"),
            repoBranch: form.get("repoBranch"),
            ideEditor: form.get("ideEditor"),
            vercelProjectUrl: form.get("vercelProjectUrl"),
            productionUrl: form.get("productionUrl"),
            previewUrl: form.get("previewUrl"),
            rotateIdeKey: form.get("rotateIdeKey") === "on",
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Repository URL">
            <input name="repoUrl" type="url" defaultValue={project.repoUrl ?? ""} placeholder="https://github.com/org/repo" className={inputClass} />
          </Field>
          <Field label="Branch">
            <input name="repoBranch" defaultValue={project.repoBranch ?? "main"} className={inputClass} />
          </Field>
          <Field label="IDE">
            <select name="ideEditor" defaultValue={project.ideEditor ?? ""} className={inputClass}>
              <option value="">Not set</option>
              <option value="Cursor">Cursor</option>
              <option value="VS Code">VS Code</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Vercel project">
            <input name="vercelProjectUrl" type="url" defaultValue={project.vercelProjectUrl ?? ""} placeholder="https://vercel.com/org/project" className={inputClass} />
          </Field>
          <Field label="Production URL">
            <input name="productionUrl" type="url" defaultValue={project.productionUrl ?? ""} placeholder="https://project.com" className={inputClass} />
          </Field>
          <Field label="Preview URL">
            <input name="previewUrl" type="url" defaultValue={project.previewUrl ?? ""} placeholder="https://project.vercel.app" className={inputClass} />
          </Field>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">IDE key</div>
          <p className="mt-2 break-all font-mono text-xs text-slate-300">
            {project.ideApiKey ?? "No key yet. Generate one and send it with commit updates."}
          </p>
          <label className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <input name="rotateIdeKey" type="checkbox" className="accent-emerald-500" />
            Generate a new IDE key when saving
          </label>
        </div>
        <SaveButton pending={save.pending} error={save.error} label="Save development settings" />
      </form>
    </Section>
  );
}

function PublishSection({ project }: { project: StudioProject }) {
  return (
    <Section id="publish" title="Publish" hint="These blocks show on the public page only after you add them here.">
      <div className="grid gap-6 lg:grid-cols-3">
        <SandboxPublisher project={project} />
        <BountyPublisher project={project} />
        <SponsorPublisher project={project} />
      </div>
    </Section>
  );
}

function useStudioSave() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function run(body: Record<string, unknown>, form?: HTMLFormElement) {
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(data?.error || "Could not save");
        return;
      }
      form?.reset();
      router.refresh();
    } catch {
      setError("Could not save");
    } finally {
      setPending(false);
    }
  }

  return { pending, error, run };
}

function Section({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{hint}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-mono text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function SaveButton({ pending, error, label }: { pending: boolean; error: string; label: string }) {
  return (
    <div>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving..." : label}
      </button>
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-[11px] font-mono text-slate-500 hover:text-rose-300">
      Remove
    </button>
  );
}

function RecordList({
  rows,
  empty,
  onRemove,
}: {
  rows: Array<{ id: string; title: string; detail: string }>;
  empty: string;
  onRemove: (id: string) => void;
}) {
  if (rows.length === 0) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{row.title}</div>
            <div className="truncate text-xs text-slate-400">{row.detail}</div>
          </div>
          <RemoveButton onClick={() => onRemove(row.id)} />
        </li>
      ))}
    </ul>
  );
}

function SandboxPublisher({ project }: { project: StudioProject }) {
  const save = useStudioSave();
  return (
    <PublishCard title="Sandbox">
      <RecordList
        empty="No sandbox published."
        rows={project.sandboxes.map((sandbox) => ({
          id: sandbox.id,
          title: sandbox.title,
          detail: sandbox.sandboxUrl,
        }))}
        onRemove={(id) => void save.run({ action: "deleteSandbox", slug: project.slug, id })}
      />
      <form
        className="mt-3 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void save.run(
            {
              action: "addSandbox",
              slug: project.slug,
              title: form.get("title"),
              sandboxUrl: form.get("sandboxUrl"),
              environment: form.get("environment"),
            },
            event.currentTarget
          );
        }}
      >
        <input name="title" required placeholder="Title" className={inputClass} />
        <input name="sandboxUrl" type="url" required placeholder="https://stackblitz.com/..." className={inputClass} />
        <input name="environment" placeholder="Node.js / React" className={inputClass} />
        <SaveButton pending={save.pending} error={save.error} label="Publish sandbox" />
      </form>
    </PublishCard>
  );
}

function BountyPublisher({ project }: { project: StudioProject }) {
  const save = useStudioSave();
  return (
    <PublishCard title="Bounty">
      <RecordList
        empty="No bounties published."
        rows={project.bounties.map((bounty) => ({
          id: bounty.id,
          title: `${bounty.title} · $${bounty.rewardUsd}`,
          detail: bounty.description,
        }))}
        onRemove={(id) => void save.run({ action: "deleteBounty", slug: project.slug, id })}
      />
      <form
        className="mt-3 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void save.run(
            {
              action: "addBounty",
              slug: project.slug,
              title: form.get("title"),
              description: form.get("description"),
              rewardUsd: form.get("rewardUsd"),
            },
            event.currentTarget
          );
        }}
      >
        <input name="title" required placeholder="Task title" className={inputClass} />
        <textarea name="description" required rows={2} placeholder="What done looks like" className={inputClass} />
        <input name="rewardUsd" type="number" min={1} required placeholder="Reward USD" className={inputClass} />
        <SaveButton pending={save.pending} error={save.error} label="Publish bounty" />
      </form>
    </PublishCard>
  );
}

function SponsorPublisher({ project }: { project: StudioProject }) {
  const save = useStudioSave();
  return (
    <PublishCard title="Sponsor">
      <RecordList
        empty="No sponsors published."
        rows={project.sponsors.map((sponsor) => ({
          id: sponsor.id,
          title: sponsor.sponsorName,
          detail: `${sponsor.tierName} · $${sponsor.amountPaidUsd}`,
        }))}
        onRemove={(id) => void save.run({ action: "deleteSponsor", slug: project.slug, id })}
      />
      <form
        className="mt-3 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void save.run(
            {
              action: "addSponsor",
              slug: project.slug,
              sponsorName: form.get("sponsorName"),
              websiteUrl: form.get("websiteUrl"),
              tierName: form.get("tierName"),
              amountPaidUsd: form.get("amountPaidUsd"),
            },
            event.currentTarget
          );
        }}
      >
        <input name="sponsorName" required placeholder="Sponsor name" className={inputClass} />
        <input name="websiteUrl" type="url" required placeholder="https://brand.com" className={inputClass} />
        <input name="tierName" placeholder="Gold Sponsor" className={inputClass} />
        <input name="amountPaidUsd" type="number" min={1} required placeholder="Amount USD" className={inputClass} />
        <SaveButton pending={save.pending} error={save.error} label="Publish sponsor" />
      </form>
    </PublishCard>
  );
}

function PublishCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <h3 className="mb-3 text-sm font-bold text-white">{title}</h3>
      {children}
    </div>
  );
}
