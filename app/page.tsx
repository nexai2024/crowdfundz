"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Zap,
  ChevronDown,
  ExternalLink,
  Users,
  Code2,
  Rocket,
  CreditCard,
  Lock,
  ArrowRight,
  Heart,
  X,
} from "lucide-react";

interface Tier {
  id: string;
  name: string;
  price: number;
  description: string;
  badge?: string;
  popular?: boolean;
  perks: string[];
}

interface Backer {
  id: string;
  name: string;
  handle: string;
  amount: number;
  backerNumber: number;
  message?: string;
}

const TIERS: Tier[] = [
  {
    id: "tier_believer",
    name: "Day 1 Believer",
    price: 2,
    badge: "Micro-Pledge",
    description: "Proof of concept pledge. Zero-friction solidarity for independent software builders.",
    perks: [
      "Permanent placement on Protocol100 Genesis Backer Wall",
      "Weekly build telemetry & revenue logs",
      "Dynamic shareable backer badge",
    ],
  },
  {
    id: "tier_sprint",
    name: "The Sprint Backer",
    price: 19,
    popular: true,
    badge: "Most Popular",
    description: "Direct lifetime access to the Protocol100 execution app and 100-day checklist.",
    perks: [
      "Protocol100 web app lifetime access",
      "Complete 100-day prompt & checklist framework",
      "Private Discord accountability community",
      "Weekly live demo access",
    ],
  },
  {
    id: "tier_stack",
    name: "The Sovereign Stack",
    price: 49,
    badge: "Bundle",
    description: "The complete one-person business stack: Protocol100 + Solopreneur OS.",
    perks: [
      "All Sprint Backer deliverables",
      "Solopreneur OS lifetime license (CRM, leads, env variables)",
      "Production Next.js boilerplate templates",
    ],
  },
  {
    id: "tier_founder",
    name: "The Indie Founder Bundle",
    price: 99,
    badge: "All-in-One",
    description: "The full toolchain: Protocol100 + Solopreneur OS + devIDE cloud environment.",
    perks: [
      "All Sovereign Stack perks",
      "devIDE (devide.online) lifetime access",
      "Featured project profile in community showcase",
    ],
  },
  {
    id: "tier_patron",
    name: "Founding Patron",
    price: 250,
    badge: "Limited (10)",
    description: "Direct access and permanent recognition as a foundational sponsor.",
    perks: [
      "All Indie Founder perks",
      "60-minute 1-on-1 architecture teardown session",
      "Permanent logo/link on the Protocol100 footer",
    ],
  },
];

const INITIAL_BACKERS: Backer[] = [
  { id: "1", name: "Alex Rivera", handle: "arivera_dev", amount: 19, backerNumber: 1, message: "Rooting for this. Kill the VC bloat." },
  { id: "2", name: "Elena Rostova", handle: "erostova", amount: 49, backerNumber: 2, message: "Solopreneur OS is exactly what I needed." },
  { id: "3", name: "Marcus Chen", handle: "mchen_builds", amount: 2, backerNumber: 3, message: "$2 well spent. Let's see Day 100." },
  { id: "4", name: "Sarah Jenkins", handle: "sjenkins", amount: 99, backerNumber: 4, message: "Full bundle. Ready for the ride." },
  { id: "5", name: "Tariq Vance", handle: "tvance_code", amount: 2, backerNumber: 5, message: "Solo builders unite." },
  { id: "6", name: "Kenji Sato", handle: "kenjisato", amount: 19, backerNumber: 6, message: "Ship it!" },
];

const ROADMAP_PHASES = [
  {
    phase: "Phase 1: Days 1–25",
    title: "Validation & Core Architecture",
    description: "Establish zero-fluff core logic, Prisma contracts, authentication, and continuous deployment pipeline.",
    tag: "Days 1–25",
  },
  {
    phase: "Phase 2: Days 26–50",
    title: "The Minimum Lovable Product",
    description: "Build out the single core execution loop. No unnecessary feature creep or premature optimization.",
    tag: "Days 26–50",
  },
  {
    phase: "Phase 3: Days 51–75",
    title: "Payment Rails & Distribution",
    description: "Embed Stripe billing, backer webhooks, and launch cold distribution channels in builder hubs.",
    tag: "Days 51–75",
  },
  {
    phase: "Phase 4: Days 76–100",
    title: "Public Launch & First Revenue",
    description: "Open access to public cohorts, initiate live onboarding calls, and secure first monetized users.",
    tag: "Days 76–100",
  },
];

const FAQS = [
  {
    q: "Why back for just $2? Does that actually help?",
    a: "Yes. Crowdfunding momentum relies on velocity and social proof. When hundreds of backers pledge $2, it proves real demand and triggers algorithmic visibility across creator communities.",
  },
  {
    q: "When do I get access to Protocol100?",
    a: "Backers get instant access to the private Discord community and weekly telemetry updates. Software access unlocks progressively throughout the 100-day build sprint.",
  },
  {
    q: "What is the relationship between Protocol100 and the Crowdfunding platform?",
    a: "Protocol100 is Campaign #1 running on this engine. Once this campaign concludes, the underlying multi-tenant software is packaged into a turnkey SaaS platform for other solopreneurs.",
  },
  {
    q: "What if you don't hit the funding target?",
    a: "The sprint happens regardless. The code is being written every day. Backing accelerates tooling runway, domain infrastructure, and open platform features.",
  },
];

export default function CampaignLandingPage() {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [backers, setBackers] = useState<Backer[]>(INITIAL_BACKERS);
  const [totalRaised, setTotalRaised] = useState<number>(1420);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Modal checkout form state
  const [backerName, setBackerName] = useState("");
  const [backerHandle, setBackerHandle] = useState("");
  const [backerEmail, setBackerEmail] = useState("");
  const [backerMessage, setBackerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TARGET_GOAL = 5000;
  const progressPercent = Math.min(100, Math.round((totalRaised / TARGET_GOAL) * 100));

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: selectedTier.id,
          name: backerName || "Anonymous Builder",
          handle: backerHandle,
          email: backerEmail,
          message: backerMessage,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // Fallback demo behavior if running locally without active Stripe keys
      const newBacker: Backer = {
        id: Date.now().toString(),
        name: backerName || "Anonymous Backer",
        handle: backerHandle.replace("@", "") || "solo_builder",
        amount: selectedTier.price,
        backerNumber: backers.length + 1,
        message: backerMessage || "Backed the mission!",
      };
      setBackers([newBacker, ...backers]);
      setTotalRaised((prev) => prev + selectedTier.price);
      setSelectedTier(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-grid-pattern">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight text-white">
              PROTOCOL100
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              DAY 0 OF 100 • PUBLIC SPRINT
            </span>
            <a
              href="#tiers"
              className="py-1.5 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
            >
              Back Campaign
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE BUILD-IN-PUBLIC EXPERIMENT</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          100 Days. 1 Solo Builder. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            0 Venture Capital.
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Fuel the Protocol100 experiment. A structured 100-day execution framework that forces solo founders to ship, launch, and monetize their software out in the open.
        </p>

        {/* Live Funding Progress Meter */}
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-2xl text-left">
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <span className="text-3xl font-extrabold font-mono text-white">
                ${totalRaised.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-slate-400 ml-2">
                raised of ${TARGET_GOAL.toLocaleString()} goal
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {backers.length}
              </span>
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
            <span>28 Days Remaining</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setSelectedTier(TIERS[0])}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-slate-950" />
            Back for $2 (Genesis Wall)
          </button>
          <a
            href="#roadmap"
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-semibold transition"
          >
            Explore 100-Day Roadmap ↓
          </a>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="px-6 py-16 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-3xl mx-auto text-left">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            The Philosophy
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-6">
            Tech bloat takes millions. Grit takes code.
          </h2>

          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>
              Venture capital funds 50-person engineering teams that spend 18 months deciding on button radiuses and burn runways on overhead. Meanwhile, thousands of solo engineers with working code give up because building alone without audience feedback is brutal.
            </p>
            <p>
              Protocol100 proves that one engineer with disciplined milestones, transparent metrics, and public accountability can deliver more value than a bloated software studio.
            </p>
          </div>

          <blockquote className="mt-6 p-4 rounded-xl border-l-2 border-emerald-500 bg-slate-900/40 text-xs font-mono text-slate-400">
            "A $2 donation is an algorithmic signal: a vote against tech gatekeeping and proof that independent software belongs to independent builders."
          </blockquote>
        </div>
      </section>

      {/* Roadmap Tabs */}
      <section id="roadmap" className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            Execution Blueprint
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">The 100-Day Sprint</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {ROADMAP_PHASES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhaseIndex(idx)}
              className={`p-3 rounded-xl border text-left transition ${
                activePhaseIndex === idx
                  ? "bg-slate-900 border-emerald-500/50 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-mono text-emerald-400">{p.tag}</div>
              <div className="text-xs font-bold truncate mt-1">{p.phase.split(":")[1]}</div>
            </button>
          ))}
        </div>

        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-left">
          <span className="text-xs font-mono text-emerald-400">
            {ROADMAP_PHASES[activePhaseIndex].phase}
          </span>
          <h3 className="text-xl font-bold text-white mt-1 mb-3">
            {ROADMAP_PHASES[activePhaseIndex].title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {ROADMAP_PHASES[activePhaseIndex].description}
          </p>
        </div>
      </section>

      {/* Rewards Matrix */}
      <section id="tiers" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            Choose Your Level
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">Pledge & Unlock Tooling</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition relative ${
                tier.popular
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
                    ${tier.price}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">one-time</span>
                </div>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {tier.description}
                </p>

                <ul className="space-y-2.5 mb-6 text-xs text-slate-300">
                  {tier.perks.map((perk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedTier(tier)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition ${
                  tier.popular
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                Pledge ${tier.price}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Genesis Backer Wall */}
      <section className="px-6 py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                Immutable Ledger
              </span>
              <h2 className="text-3xl font-bold text-white mt-1">Genesis Backer Wall</h2>
            </div>
            <Link
              href="/wall"
              className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
            >
              View Full Backer Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {backers.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
              >
                <div className="flex justify-between items-center text-slate-500 font-mono mb-1">
                  <span>#{b.backerNumber}</span>
                  <span className="text-emerald-400 font-semibold">${b.amount}</span>
                </div>
                <div className="font-semibold text-white truncate">{b.name}</div>
                {b.handle && <div className="text-[11px] font-mono text-slate-400">@{b.handle}</div>}
                {b.message && (
                  <p className="mt-2 text-slate-300 italic text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800/40">
                    "{b.message}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 text-left flex justify-between items-center text-sm font-semibold text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaqIndex === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-8 text-center text-xs font-mono text-slate-500">
        <p>PROTOCOL100 • BUILT IN PUBLIC • REPLICABLE INDIE ENGINE</p>
      </footer>

      {/* Pledge Checkout Modal */}
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
              Complete Your Pledge
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{selectedTier.name}</h3>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 my-2">
              ${selectedTier.price} USD
            </div>

            <form onSubmit={handleCheckout} className="space-y-3 mt-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Name (Genesis Wall)
                </label>
                <input
                  type="text"
                  required
                  value={backerName}
                  onChange={(e) => setBackerName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Social Handle (Optional)
                </label>
                <input
                  type="text"
                  value={backerHandle}
                  onChange={(e) => setBackerHandle(e.target.value)}
                  placeholder="@handle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Email (For updates & license delivery)
                </label>
                <input
                  type="email"
                  required
                  value={backerEmail}
                  onChange={(e) => setBackerEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Short Encouragement (Max 120 chars)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={backerMessage}
                  onChange={(e) => setBackerMessage(e.target.value)}
                  placeholder="e.g. Let's see this live!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
              >
                {isSubmitting ? "Connecting Stripe..." : `Proceed to Pay $${selectedTier.price}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}