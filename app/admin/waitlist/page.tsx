import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import WaitlistAdmin from "@/components/waitlist-admin";
import { getSessionUser } from "@/lib/current-user";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { isWaitlistStatus, listWaitlist } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

const FILTERS = ["all", "pending", "approved", "rejected", "promoted"] as const;

export default async function WaitlistAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/account");
  if (!isPlatformAdmin(user.email)) notFound();

  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status && isWaitlistStatus(params.status) ? params.status : "";
  const { entries, counts } = await listWaitlist({ q, status });
  const total = counts.pending + counts.approved + counts.rejected + counts.promoted;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">Beta intake</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">Waitlist</h1>
          </div>
          <Link href="/account" className="text-sm text-slate-400 hover:text-emerald-300">
            Back to studio
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Count label="All" value={total} />
          <Count label="Pending" value={counts.pending} />
          <Count label="Approved" value={counts.approved} />
          <Count label="Rejected" value={counts.rejected} />
          <Count label="Promoted" value={counts.promoted} />
        </div>

        <form className="mt-6 flex flex-wrap items-center gap-3" action="/admin/waitlist">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email"
            className="min-w-64 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-hidden"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white"
          >
            {FILTERS.map((filter) => (
              <option key={filter} value={filter === "all" ? "" : filter}>
                {filter}
              </option>
            ))}
          </select>
          <button className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950">Apply</button>
        </form>

        <div className="mt-6">
          <WaitlistAdmin
            key={`${q}:${status}`}
            entries={entries.map((entry) => ({
              id: entry.id,
              name: entry.name,
              email: entry.email,
              message: entry.message,
              status: entry.status,
              source: entry.source,
              createdAt: entry.createdAt.toISOString(),
              statusChangedAt: entry.statusChangedAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </main>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
