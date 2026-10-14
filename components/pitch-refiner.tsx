"use client";

import React, { useState } from "react";
import { Sparkles, Lightbulb, CheckCircle } from "lucide-react";

export default function PitchRefiner({
  initialTitle,
  initialTagline,
  initialStory,
  initialGoal,
}: {
  initialTitle?: string;
  initialTagline?: string;
  initialStory?: string;
  initialGoal?: number;
}) {
  const [title, setTitle] = useState(initialTitle || "");
  const [tagline, setTagline] = useState(initialTagline || "");
  const [story, setStory] = useState(initialStory || "");
  const [goal, setGoal] = useState(initialGoal || 5000);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    suggestions: string[];
    refinedTagline: string;
  } | null>(null);

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/pitch-refiner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tagline, story, targetGoal: goal }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">AI-Powered Pitch Refiner</h3>
      </div>

      <form onSubmit={handleRefine} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Title"
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <input
            type="number"
            required
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            placeholder="Goal USD"
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
        <input
          type="text"
          required
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Tagline pitch..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <textarea
          rows={3}
          required
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Project story and manifesto..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing Campaign Copy..." : "Refine Pitch with AI"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Optimization Score:</span>
            <span className="text-lg font-bold text-emerald-400">{result.score}/100</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Improvement Suggestions:
            </div>
            <ul className="space-y-1 text-slate-400 pl-5 list-disc">
              {result.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-400 block mb-1">Recommended Tagline:</span>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-300 flex items-center justify-between">
              <span>{result.refinedTagline}</span>
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
