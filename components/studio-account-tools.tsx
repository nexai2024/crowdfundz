"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const PAYOUT_COUNTRIES = [
  ["us", "United States"],
  ["ca", "Canada"],
  ["gb", "United Kingdom"],
  ["au", "Australia"],
  ["nz", "New Zealand"],
  ["ie", "Ireland"],
  ["de", "Germany"],
  ["fr", "France"],
  ["nl", "Netherlands"],
  ["es", "Spain"],
  ["it", "Italy"],
  ["se", "Sweden"],
  ["no", "Norway"],
  ["dk", "Denmark"],
  ["fi", "Finland"],
  ["at", "Austria"],
  ["be", "Belgium"],
  ["ch", "Switzerland"],
  ["pt", "Portugal"],
  ["sg", "Singapore"],
  ["jp", "Japan"],
  ["mx", "Mexico"],
  ["br", "Brazil"],
] as const;

export function PayoutSetup({ connected }: { connected: boolean }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [country, setCountry] = useState("us");

  async function start() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error || "Could not start payout setup");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="text-lg font-bold text-white">Payouts</h3>
      <p className="mt-2 text-sm text-slate-400">
        {connected
          ? "A Stripe account is linked. Crowdventure keeps 5% of every pledge. Stripe charges its processing fee to your account on top of that 5%. Instant pledges are sent when they are paid. Milestone pledges are sent after the pull request is merged and the backer signs off."
          : "Connect Stripe before pledges can be paid out. Crowdventure keeps 5%. Stripe charges its processing fee to your account on top of that 5%."}
      </p>
      {!connected && (
        <label className="mt-4 block text-sm text-slate-300">
          Country
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            {PAYOUT_COUNTRIES.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      <button
        type="button"
        onClick={() => void start()}
        disabled={pending}
        className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {pending ? "Opening Stripe..." : connected ? "Continue payout setup" : "Connect payouts"}
      </button>
    </div>
  );
}

export function EmailConfirmation({ email, verified }: { email?: string; verified: boolean }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function send() {
    if (!email) return;
    setPending(true);
    setMessage("");
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/account",
    });
    setPending(false);
    setMessage(result.error?.message || "Confirmation email sent.");
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h3 className="text-lg font-bold text-white">Email</h3>
      <p className="mt-2 text-sm text-slate-400">
        {verified
          ? `${email} is confirmed.`
          : "Confirm your email so password resets and pledge receipts have a real address to use."}
      </p>
      {!verified && email && (
        <button
          type="button"
          onClick={() => void send()}
          disabled={pending}
          className="mt-4 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-500 disabled:opacity-50"
        >
          {pending ? "Sending..." : "Send confirmation"}
        </button>
      )}
      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
    </div>
  );
}
