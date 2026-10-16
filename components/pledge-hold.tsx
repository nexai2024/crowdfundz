"use client";

import { useState } from "react";

type Hold = {
  phaseId: string;
  label: string;
  title: string;
  amountUsd: number;
  status: string;
  signedOff: boolean;
  pullRequestMerged: boolean;
};

export default function PledgeHold({
  sessionId,
  holds,
}: {
  sessionId: string;
  holds: Hold[];
}) {
  const [rows, setRows] = useState(holds);
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");

  async function signOff(phaseId: string) {
    setPendingId(phaseId);
    setError("");
    try {
      const response = await fetch("/api/pledges/signoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, phaseId }),
      });
      const data = (await response.json()) as { error?: string; released?: boolean; message?: string };
      if (!response.ok) {
        setError(data.error || "Could not sign off");
        return;
      }
      setRows((current) =>
        current.map((row) =>
          row.phaseId === phaseId
            ? { ...row, signedOff: true, status: data.released ? "RELEASED" : row.status }
            : row
        )
      );
      if (data.message && !data.released) setError(data.message);
    } catch {
      setError("Could not sign off");
    } finally {
      setPendingId("");
    }
  }

  return (
    <div className="mt-4 space-y-2 text-left">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Milestone hold</p>
      {rows.map((row) => (
        <div key={row.phaseId} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] text-emerald-400">{row.label}</div>
              <div className="text-sm text-white">{row.title}</div>
              <div className="text-[11px] text-slate-500">${row.amountUsd} · {statusCopy(row)}</div>
            </div>
            {row.status === "HELD" && !row.signedOff && (
              <button
                type="button"
                disabled={pendingId === row.phaseId}
                onClick={() => void signOff(row.phaseId)}
                className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-slate-950 disabled:opacity-50"
              >
                {pendingId === row.phaseId ? "Signing off..." : "Sign off"}
              </button>
            )}
          </div>
        </div>
      ))}
      {error && <p className="text-xs text-slate-300">{error}</p>}
    </div>
  );
}

function statusCopy(row: Hold) {
  if (row.status === "RELEASED") return "Released to the creator";
  if (row.status === "REFUNDED") return "Refunded";
  if (row.status === "DISPUTED") return "In review";
  if (row.status === "PENDING") return "Waiting for the payment to confirm";
  if (row.signedOff && !row.pullRequestMerged) return "Signed off. Waiting for a merged pull request";
  if (!row.signedOff && row.pullRequestMerged) return "Pull request merged. Sign off to release";
  return "Held until the pull request is merged and you sign off";
}
