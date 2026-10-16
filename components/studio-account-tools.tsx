"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function PayoutSetup({ connected }: { connected: boolean }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function start() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/connect", { method: "POST" });
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
          ? "A Stripe account is linked. Finish setup there if charges are not enabled yet. Pledges transfer to that account."
          : "Connect Stripe so a pledge lands in your account instead of sitting on the platform."}
      </p>
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
