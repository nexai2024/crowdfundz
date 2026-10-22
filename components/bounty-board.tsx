"use client";

import { Award, DollarSign, X } from "lucide-react";
import { useState } from "react";
import type { BountyView } from "@/lib/landing-types";

export default function BountyBoard({
  bounties = [],
}: {
  bounties?: BountyView[];
}) {
  const [claimingBountyId, setClaimingBountyId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (bounties.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingBountyId) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bounties/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bountyId: claimingBountyId,
          contributorName: name,
          contributorEmail: email,
          submissionUrl: url,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Submission failed");
      } else {
        setClaimingBountyId(null);
        setName("");
        setEmail("");
        setUrl("");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>

    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Community Bounty Board</h3>
        </div>
        <span className="font-mono text-xs text-slate-400 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-full">
          {bounties.length} Bounties Active
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {bounties.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{b.title}</span>
                <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
                  {b.status}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">{b.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-emerald-400 font-bold text-sm font-mono flex items-center">
                <DollarSign className="h-3.5 w-3.5" />
                {b.rewardUsd}
              </span>
              <button
                onClick={() => setClaimingBountyId(b.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition text-[11px]"
              >
                Claim Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

      {claimingBountyId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setClaimingBountyId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mt-1 mb-4">Submit Bounty</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Submission URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              {error && <p className="text-xs text-rose-300">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
