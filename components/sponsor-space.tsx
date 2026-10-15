"use client";

import React, { useState } from "react";
import { Megaphone, ExternalLink, Plus } from "lucide-react";
import type { SponsorSlotView } from "@/lib/landing-types";

export default function SponsorSpace({
  campaignId,
  sponsors = [],
}: {
  campaignId?: string;
  sponsors?: SponsorSlotView[];
}) {
  const [sponsorList, setSponsorList] = useState<SponsorSlotView[]>(sponsors);

  const [sponsorName, setSponsorName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName || !websiteUrl) return;
    setIsSubmitting(true);

    try {
      if (campaignId) {
        const res = await fetch("/api/sponsors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId,
            sponsorName,
            websiteUrl,
            logoUrl: `${websiteUrl}/favicon.ico`,
            tierName: "Brand Sponsor",
            amountPaidUsd: 300,
          }),
        });
        const data = await res.json();
        setSponsorList([data, ...sponsorList]);
      } else {
        setSponsorList([
          {
            id: Date.now().toString(),
            sponsorName,
            logoUrl: `${websiteUrl}/favicon.ico`,
            websiteUrl,
            tierName: "Brand Sponsor",
            amountPaidUsd: 300,
          },
          ...sponsorList,
        ]);
      }
      setSponsorName("");
      setWebsiteUrl("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sponsorList.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Integrated Sponsor Space</h3>
        </div>
        <span className="font-mono text-xs text-slate-400 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-full">
          Brand Visibility
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {sponsorList.map((s) => (
          <a
            key={s.id}
            href={s.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-emerald-500/50 transition font-mono text-xs flex items-center justify-between gap-2"
          >
            <div className="truncate">
              <div className="font-bold text-white truncate">{s.sponsorName}</div>
              <div className="text-[10px] text-emerald-400">{s.tierName}</div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          </a>
        ))}
      </div>

      <form onSubmit={handleAddSponsor} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          required
          value={sponsorName}
          onChange={(e) => setSponsorName(e.target.value)}
          placeholder="Sponsor Brand Name"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <input
          type="url"
          required
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://brand.com"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          disabled={isSubmitting || !sponsorName}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono rounded-lg transition disabled:opacity-50 shrink-0 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Sponsor
        </button>
      </form>
    </div>
  );
}
