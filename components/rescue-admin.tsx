"use client";

import { useState } from "react";

type RescueView = {
  id: string;
  name: string;
  email: string;
  role: string;
  project: string | null;
  message?: string | null;
  allocations?: {
    id: string;
    amountUsd: number;
    status: string;
    phase: { title: string; pullRequestMergedAt: Date | null };
  }[];
};

export default function RescueAdmin({
  rescues
}: {
  rescues: RescueView[]
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (rescueId: string, action: string, allocationId?: string) => {
    setLoading(rescueId + action + (allocationId || ""));
    try {
      const res = await fetch("/api/admin/rescues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rescueId, action, allocationId })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Action failed");
      }
    } catch (error) {
      alert("Error");
    } finally {
      setLoading(null);
    }
  };

  if (rescues.length === 0) return <p className="text-slate-500">No rescue requests pending.</p>;

  return (
    <div className="space-y-4">
      {rescues.map(rescue => (
        <div key={rescue.id} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{rescue.name} <span className="text-sm font-mono text-slate-400">({rescue.email})</span></h3>
              <p className="text-sm text-slate-400">Role: <span className="text-emerald-400">{rescue.role}</span> | Project: {rescue.project}</p>
              {rescue.message && <p className="mt-2 text-sm text-slate-300 italic">&quot;{rescue.message}&quot;</p>}
            </div>
            <button
              onClick={() => handleAction(rescue.id, "mark_reviewed")}
              disabled={loading !== null}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-white transition"
            >
              Mark Reviewed
            </button>
          </div>

          {rescue.allocations && rescue.allocations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2">Held Allocations</h4>
              <div className="space-y-2">
                {rescue.allocations.map((alloc) => (
                  <div key={alloc.id} className="flex justify-between items-center bg-slate-950 p-3 rounded border border-slate-800">
                    <div>
                      <div className="text-sm font-bold text-slate-200">Phase: {alloc.phase.title}</div>
                      <div className="text-xs text-slate-400">Amount: \${alloc.amountUsd}</div>
                      <div className="text-xs text-slate-400">PR Merged: {alloc.phase.pullRequestMergedAt ? "Yes" : "No"}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(rescue.id, "release", alloc.id)}
                        disabled={loading !== null}
                        className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 text-xs transition"
                      >
                        Release
                      </button>
                      <button
                        onClick={() => handleAction(rescue.id, "refund", alloc.id)}
                        disabled={loading !== null}
                        className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30 text-xs transition"
                      >
                        Refund
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
