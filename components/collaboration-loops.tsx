"use client";

import React, { useState } from "react";
import { Network, ArrowRight, Link as LinkIcon } from "lucide-react";
import type { CollaborationLoopView } from "@/lib/landing-types";

export default function CollaborationLoops({
  campaignId,
  collaborations = [],
}: {
  campaignId?: string;
  collaborations?: CollaborationLoopView[];
}) {
  const [collabList, setCollabList] = useState<CollaborationLoopView[]>(
    collaborations.length > 0
      ? collaborations
      : [
          {
            id: "c1",
            partnerSubdomain: "protocol",
            partnerSlug: "protocol100",
            partnerTitle: "Protocol100 Auth Suite",
            discountPercentage: 15,
          },
        ]
  );

  const [partnerSubdomain, setPartnerSubdomain] = useState("");
  const [partnerSlug, setPartnerSlug] = useState("");
  const [partnerTitle, setPartnerTitle] = useState("");

  const handleAddCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerSubdomain || !partnerSlug || !partnerTitle) return;

    try {
      if (campaignId) {
        const res = await fetch("/api/collaborations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId,
            partnerSubdomain,
            partnerSlug,
            partnerTitle,
            discountPercentage: 10,
          }),
        });
        const newCollab = await res.json();
        setCollabList([newCollab, ...collabList]);
      } else {
        setCollabList([
          {
            id: Date.now().toString(),
            partnerSubdomain,
            partnerSlug,
            partnerTitle,
            discountPercentage: 10,
          },
          ...collabList,
        ]);
      }
      setPartnerSubdomain("");
      setPartnerSlug("");
      setPartnerTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Cross-Project Collaboration Loops</h3>
        </div>
        <span className="font-mono text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
          Cross-Promotional Perks
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {collabList.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 font-mono text-xs flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5 text-emerald-400" /> {c.partnerTitle}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {c.partnerSubdomain}.crowdventure.quest/{c.partnerSlug}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                {c.discountPercentage}% Backer Perk Bundle
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddCollab} className="grid sm:grid-cols-3 gap-2">
        <input
          type="text"
          required
          value={partnerSubdomain}
          onChange={(e) => setPartnerSubdomain(e.target.value)}
          placeholder="Partner Subdomain"
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <input
          type="text"
          required
          value={partnerSlug}
          onChange={(e) => setPartnerSlug(e.target.value)}
          placeholder="Partner Campaign Slug"
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <input
          type="text"
          required
          value={partnerTitle}
          onChange={(e) => setPartnerTitle(e.target.value)}
          placeholder="Partner Project Title"
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          className="sm:col-span-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono rounded-lg transition flex items-center justify-center gap-1"
        >
          Link Partner Collaboration Loop <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
