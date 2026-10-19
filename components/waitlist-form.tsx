"use client";

import { useState, type FormEvent } from "react";

type View = "form" | "joined" | "already";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm() {
  const [view, setView] = useState<View>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setError("Enter your full name.");
      return;
    }
    if (!EMAIL.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (message.trim().length > 1000) {
      setError("Keep the note under 1000 characters.");
      return;
    }
    if (!consent) {
      setError("Consent is required to join the beta list.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: normalizedEmail,
          message: message.trim(),
          consent,
          companyWebsite,
          source: "beta-landing",
        }),
      });
      const data = (await response.json()) as { error?: string; code?: string; status?: string };
      if (response.status === 409 || data.code === "already_listed") {
        setView("already");
        return;
      }
      if (!response.ok) {
        setError(data.error || "Could not join the waitlist.");
        return;
      }
      setView("joined");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  if (view === "joined") {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-emerald-300">You're on the list</p>
        <h2 className="mt-3 text-2xl font-bold text-white">Thanks. We'll write when a spot opens.</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          A confirmation is on its way to your inbox. Keep an eye out for a separate invite when the studio is ready.
        </p>
      </div>
    );
  }

  if (view === "already") {
    return (
      <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-emerald-300">Already listed</p>
        <h2 className="mt-3 text-2xl font-bold text-white">You're already on the list.</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          We have this email. There's nothing else to submit — we'll use the same address for the invite.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white">Request a beta spot</h2>
      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-500">Full name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-500">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-500">
            Message to the founder <span className="normal-case tracking-normal text-slate-600">(optional)</span>
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            maxLength={1000}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500"
          />
          <span>I agree to be contacted about the CrowdVenture beta at this email address.</span>
        </label>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label>
            Company website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={companyWebsite}
              onChange={(event) => setCompanyWebsite(event.target.value)}
            />
          </label>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {pending ? "Sending..." : "Join the waitlist"}
      </button>
    </form>
  );
}
