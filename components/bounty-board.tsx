"use client";

import React, { useState } from "react";
import { Award, Plus, DollarSign } from "lucide-react";
import type { BountyView } from "@/lib/landing-types";

export default function BountyBoard({
  campaignId,
  bounties = [],
}: {
  campaignId?: string;
  bounties?: BountyView[];
}) {
  const [bountyList, setBountyList] = useState<BountyView[]>(bounties);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardUsd, setRewardUsd] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsSubmitting(true);

    try {
      if (campaignId) {
        const res = await fetch("/api/bounties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId, title, description, rewardUsd }),
        });
        const newBounty = await res.json();
        setBountyList([newBounty, ...bountyList]);
      } else {
        setBountyList([
          {
            id: Date.now().toString(),
            title,
            description,
            rewardUsd,
            status: "OPEN",
          },
          ...bountyList,
        ]);
      }
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bountyList.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Community Bounty Board</h3>
        </div>
        <span className="font-mono text-xs text-slate-400 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-full">
          {bountyList.length} Bounties Active
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {bountyList.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{b.title}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
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
              <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition text-[11px]">
                Claim Task
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreateBounty} className="space-y-3 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New Bounty Title..."
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <input
            type="number"
            required
            value={rewardUsd}
            onChange={(e) => setRewardUsd(Number(e.target.value))}
            placeholder="Reward USD"
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task requirements and deliverables..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          disabled={isSubmitting || !title}
          className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <Plus className="h-4 w-4" /> Post Bounty Reward
        </button>
      </form>
    </div>
  );
}
