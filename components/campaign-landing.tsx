"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  ChevronDown,
  ArrowRight,
  Heart,
  X,
} from "lucide-react";
import type { CampaignLandingData, CampaignTierView } from "@/lib/landing-types";

type BackerState = CampaignLandingData["backers"][number];

export default function CampaignLanding({ campaign }: { campaign: CampaignLandingData }) {
  const [selectedTier, setSelectedTier] = useState<CampaignTierView | null>(null);
  const [backers, setBackers] = useState<BackerState[]>(campaign.backers);
  const [totalRaised, setTotalRaised] = useState(campaign.totalRaised);
  const [backerCount, setBackerCount] = useState(campaign.backerCount);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [backerName, setBackerName] = useState("");
  const [backerHandle, setBackerHandle] = useState("");
  const [backerEmail, setBackerEmail] = useState("");
  const [backerMessage, setBackerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const progressPercent = Math.min(
    100,
    Math.round((totalRaised / Math.max(campaign.targetGoal, 1)) * 100)
  );
  const entryTier = campaign.tiers[0];
  const storyParagraphs = campaign.story.split(/\n\n+/).filter(Boolean);
  const activePhase = campaign.phases[activePhaseIndex];

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTier) return;
    setIsSubmitting(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: selectedTier.id,
          subdomain: campaign.subdomain,
          slug: campaign.slug,
          name: backerName || "Anonymous Builder",
          handle: backerHandle,
          email: backerEmail,
          message: backerMessage,
          origin: window.location.origin,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setCheckoutError(data.error || "Checkout is unavailable right now.");
    } catch {
      const pledge: BackerState = {
        id: Date.now().toString(),
        name: backerName || "Anonymous Backer",
        handle: backerHandle.replace("@", "") || null,
        amountUsd: selectedTier.priceUsd,
        backerNumber: backerCount + 1,
        message: backerMessage || "Backed the mission.",
      };
      setBackers([pledge, ...backers]);
      setTotalRaised((current) => current + selectedTier.priceUsd);
      setBackerCount((current) => current + 1);
      setSelectedTier(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link href={campaign.homeHref} className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <span className="min-w-0">
              <span className="block font-mono text-sm font-bold tracking-tight text-white truncate">
                {campaign.title}
              </span>
              <span className="block text-[10px] font-mono text-slate-500 truncate">
                {campaign.subdomain}/{campaign.slug}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {campaign.statusLabel && (
              <span className="hidden sm:inline-block text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {campaign.statusLabel}
              </span>
            )}
            <a
              href="#tiers"
              className="py-1.5 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
            >
              Back Campaign
            </a>
          </div>
        </div>
      </header>

      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        {campaign.eyebrow && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{campaign.eyebrow}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          {campaign.title}
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {campaign.tagline}
        </p>

        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-2xl text-left">
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <span className="text-3xl font-extrabold font-mono text-white">
                ${totalRaised.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-slate-400 ml-2">
                raised of ${campaign.targetGoal.toLocaleString()} goal
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-emerald-400">{backerCount}</span>
              <span className="text-xs font-mono text-slate-400 ml-1">backers</span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-4">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-slate-500">
            <span>{progressPercent}% Funded</span>
            {campaign.daysRemaining !== null && (
              <span>
                {campaign.daysRemaining} {campaign.daysRemaining === 1 ? "Day" : "Days"} Remaining
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {entryTier && (
            <button
              onClick={() => setSelectedTier(entryTier)}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-slate-950" />
              Back for ${entryTier.priceUsd}
              {entryTier.badge ? ` (${entryTier.badge})` : ""}
            </button>
          )}
          {campaign.phases.length > 0 && (
            <a
              href="#roadmap"
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-semibold transition"
            >
              Explore the roadmap ↓
            </a>
          )}
        </div>
      </section>

      <section className="px-6 py-16 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-3xl mx-auto text-left">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            The story
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-6">
            {campaign.manifestoTitle || `Why ${campaign.title} exists`}
          </h2>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            {storyParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          {campaign.manifestoQuote && (
            <blockquote className="mt-6 p-4 rounded-xl border-l-2 border-emerald-500 bg-slate-900/40 text-xs font-mono text-slate-400">
              &ldquo;{campaign.manifestoQuote}&rdquo;
            </blockquote>
          )}
        </div>
      </section>

      {campaign.phases.length > 0 && activePhase && (
        <section id="roadmap" className="px-6 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Execution blueprint
            </span>
            <h2 className="text-3xl font-bold text-white mt-2">The plan</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
            {campaign.phases.map((phase, index) => (
              <button
                key={phase.id}
                onClick={() => setActivePhaseIndex(index)}
                className={`p-3 rounded-xl border text-left transition ${
                  activePhaseIndex === index
                    ? "bg-slate-900 border-emerald-500/50 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-[10px] font-mono text-emerald-400">{phase.label}</div>
                <div className="text-xs font-bold truncate mt-1">{phase.title}</div>
              </button>
            ))}
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-left">
            <span className="text-xs font-mono text-emerald-400">{activePhase.label}</span>
            <h3 className="text-xl font-bold text-white mt-1 mb-3">{activePhase.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{activePhase.description}</p>
          </div>
        </section>
      )}

      <section id="tiers" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            Choose your level
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">Pledge and unlock the work</h2>
        </div>

        {campaign.tiers.length === 0 ? (
          <p className="text-center text-sm text-slate-400">Pledge levels have not been published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {campaign.tiers.map((tier) => (
              <div
                key={tier.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition relative ${
                  tier.featured
                    ? "bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/5"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase font-mono">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-white text-base mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-3xl font-extrabold font-mono text-emerald-400">
                      ${tier.priceUsd}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">one-time</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">{tier.description}</p>
                  <ul className="space-y-2.5 mb-6 text-xs text-slate-300">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setSelectedTier(tier)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition ${
                    tier.featured
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  Pledge ${tier.priceUsd}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-6 py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                Public ledger
              </span>
              <h2 className="text-3xl font-bold text-white mt-1">Backer wall</h2>
            </div>
            <Link
              href={campaign.wallHref}
              className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
            >
              View full backer directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {backers.length === 0 ? (
            <p className="text-sm text-slate-400">No confirmed backers yet. The wall fills in as pledges clear.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {backers.map((backer) => (
                <div
                  key={backer.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex justify-between items-center text-slate-500 font-mono mb-1">
                    <span>#{backer.backerNumber}</span>
                    <span className="text-emerald-400 font-semibold">${backer.amountUsd}</span>
                  </div>
                  <div className="font-semibold text-white truncate">{backer.name}</div>
                  {backer.handle && (
                    <div className="text-[11px] font-mono text-slate-400">@{backer.handle}</div>
                  )}
                  {backer.message && (
                    <p className="mt-2 text-slate-300 italic text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800/40">
                      &ldquo;{backer.message}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {campaign.faqs.length > 0 && (
        <section className="px-6 py-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {campaign.faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-4 text-left flex justify-between items-center gap-4 text-sm font-semibold text-white"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      openFaqIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-slate-900 px-6 py-8 text-center text-xs font-mono text-slate-500">
        <p>
          {campaign.creatorName} · {campaign.subdomain}/{campaign.slug} ·{" "}
          <Link href={campaign.homeHref} className="hover:text-emerald-400">
            All projects
          </Link>
        </p>
      </footer>

      {selectedTier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTier(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
              Complete your pledge
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{selectedTier.name}</h3>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 my-2">
              ${selectedTier.priceUsd} USD
            </div>

            <form onSubmit={handleCheckout} className="space-y-3 mt-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={backerName}
                  onChange={(event) => setBackerName(event.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Social handle (optional)
                </label>
                <input
                  type="text"
                  value={backerHandle}
                  onChange={(event) => setBackerHandle(event.target.value)}
                  placeholder="@handle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={backerEmail}
                  onChange={(event) => setBackerEmail(event.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Short note (max 120 characters)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={backerMessage}
                  onChange={(event) => setBackerMessage(event.target.value)}
                  placeholder="e.g. Let's see this live"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {checkoutError && <p className="text-xs text-rose-300">{checkoutError}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
              >
                {isSubmitting ? "Connecting checkout..." : `Proceed to pay $${selectedTier.priceUsd}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
