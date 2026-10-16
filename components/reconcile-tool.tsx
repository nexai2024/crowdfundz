"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReconcileReport = {
  checked: number;
  confirmed: number;
  stillPending: number;
  payoutsSettled: number;
  adjustments: Array<{
    campaign: string;
    title: string;
    recordedRaised: number;
    confirmedRaised: number;
    recordedBackers: number;
    confirmedBackers: number;
  }>;
  errors: string[];
};

export function ReconcileTool({
  scope,
  title,
  detail,
}: {
  scope: "studio" | "platform";
  title: string;
  detail: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReconcileReport | null>(null);

  async function run() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const data = (await response.json()) as ReconcileReport & { error?: string };
      if (!response.ok) {
        setError(data.error || "Reconcile failed");
        return;
      }
      setReport(data);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      <button
        type="button"
        onClick={() => void run()}
        disabled={pending}
        className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {pending ? "Checking Stripe..." : "Reconcile pledges"}
      </button>
      {report && (
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <p>
            Checked {report.checked} open pledges. Confirmed {report.confirmed}. Still unpaid{" "}
            {report.stillPending}. Payouts sent {report.payoutsSettled}.
          </p>
          {report.adjustments.map((row) => (
            <p key={row.campaign} className="font-mono text-xs text-slate-400">
              {row.title}: ${row.recordedRaised.toLocaleString()} / {row.recordedBackers} backers recorded,{" "}
              ${row.confirmedRaised.toLocaleString()} / {row.confirmedBackers} confirmed
            </p>
          ))}
          {report.errors.map((message) => (
            <p key={message} className="text-rose-300">
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
