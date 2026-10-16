"use client";

import React, { useState } from "react";
import { Vote, CheckCircle2 } from "lucide-react";
import type { GovernancePollView } from "@/lib/landing-types";

export default function TokenizedGovernance({
  campaignId,
  polls = [],
}: {
  campaignId?: string;
  polls?: GovernancePollView[];
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const activePoll = polls[0];
  if (!activePoll) return null;

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption === null || !voterEmail) return;

    setVoteError("");
    try {
      const response = await fetch("/api/governance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: activePoll.id,
          campaignId,
          backerEmail: voterEmail,
          optionIndex: selectedOption,
        }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setVoteError(data?.error || "Could not record that vote");
        return;
      }
      setHasVoted(true);
    } catch (err) {
      console.error(err);
      setVoteError("Could not record that vote");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Backer Perk Governance</h3>
        </div>
        <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          {activePoll.status}
        </span>
      </div>

      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950">
        <h4 className="font-bold text-white text-sm">{activePoll.title}</h4>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed mb-4">{activePoll.description}</p>

        {!hasVoted ? (
          <form onSubmit={handleVote} className="space-y-3">
            <div className="space-y-2">
              {activePoll.options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-mono transition flex items-center justify-between ${
                    selectedOption === idx
                      ? "border-emerald-500 bg-emerald-500/10 text-white"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span>{opt}</span>
                  {selectedOption === idx && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <input
                type="email"
                required
                value={voterEmail}
                onChange={(e) => setVoterEmail(e.target.value)}
                placeholder="Backer Email Address"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                disabled={selectedOption === null || !voterEmail}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono rounded-lg transition disabled:opacity-50"
              >
                Cast Weighted Vote
              </button>
            </div>
            {voteError && <p className="text-xs text-rose-300">{voteError}</p>}
          </form>
        ) : (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono text-center">
            ✓ Vote recorded! Your backer tier weight has been applied to option: {activePoll.options[selectedOption!]}
          </div>
        )}
      </div>
    </div>
  );
}
