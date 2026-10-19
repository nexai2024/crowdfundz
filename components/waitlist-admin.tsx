"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type WaitlistAdminRow = {
  id: string;
  name: string;
  email: string;
  message: string | null;
  status: "pending" | "approved" | "rejected" | "promoted";
  source: string;
  createdAt: string;
  statusChangedAt: string;
};

const ACTIONS = ["approve", "reject", "promote"] as const;

export default function WaitlistAdmin({ entries }: { entries: WaitlistAdminRow[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? "");
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");
  const selected = entries.find((entry) => entry.id === selectedId) ?? null;

  async function act(id: string, action: (typeof ACTIONS)[number]) {
    setPendingId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not update that entry.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPendingId("");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-900/80 font-mono text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-slate-400">
                  No entries match this view.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className={`border-t border-slate-800 ${selectedId === entry.id ? "bg-slate-900/80" : "bg-slate-950"}`}
              >
                <td className="px-4 py-3">
                  <button type="button" onClick={() => setSelectedId(entry.id)} className="font-semibold text-white hover:text-emerald-300">
                    {entry.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-300">{entry.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 font-mono text-[11px] uppercase text-slate-300">
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(entry.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {ACTIONS.map((action) => (
                      <button
                        key={action}
                        type="button"
                        disabled={pendingId === entry.id || !canAct(entry.status, action)}
                        onClick={() => act(entry.id, action)}
                        className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-semibold capitalize text-white hover:border-emerald-500 disabled:opacity-40"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Entry</p>
        {selected ? (
          <>
            <h2 className="mt-2 text-xl font-bold text-white">{selected.name}</h2>
            <p className="mt-1 text-sm text-slate-300">{selected.email}</p>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Status</dt>
                <dd className="mt-1 text-white">{selected.status}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Source</dt>
                <dd className="mt-1 text-white">{selected.source}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Last status change</dt>
                <dd className="mt-1 text-white">{new Date(selected.statusChangedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Message to the founder</dt>
                <dd className="mt-1 whitespace-pre-wrap text-slate-200">{selected.message || "No message."}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-400">Select an entry to read the note.</p>
        )}
        {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
      </aside>
    </div>
  );
}

function canAct(status: WaitlistAdminRow["status"], action: (typeof ACTIONS)[number]) {
  if (status === "promoted") return false;
  if (action === "promote") return status === "approved";
  if (action === "approve") return status !== "approved";
  return status !== "rejected";
}
