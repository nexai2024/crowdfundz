"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

export function PledgeRoomInvite({
  subdomain,
  slug,
  title,
  signedIn,
  joined,
  roomHref,
  signInHref,
}: {
  subdomain: string;
  slug: string;
  title: string;
  signedIn: boolean;
  joined: boolean;
  roomHref: string;
  signInHref: string;
}) {
  const [member, setMember] = useState(joined);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function join() {
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/community/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain, slug }),
      });
      const data = (await response.json()) as { error?: string; joined?: boolean };
      if (!response.ok) {
        setError(data.error || "Could not join that room.");
        return;
      }
      setMember(Boolean(data.joined));
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-left">
      <div className="flex items-center gap-2 text-emerald-300">
        <Users className="h-4 w-4" />
        <p className="font-mono text-[11px] uppercase tracking-wider">Project room</p>
      </div>
      {member ? (
        <>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            You&apos;re in the {title} room. That membership puts you in the CrowdVenture community.
          </p>
          <Link href={roomHref} className="mt-4 inline-flex text-sm font-semibold text-emerald-300 hover:text-emerald-200">
            Open the room
          </Link>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            Join the {title} room. That one step makes you a member of the CrowdVenture community, where this
            project&apos;s comments live.
          </p>
          {signedIn ? (
            <button
              type="button"
              onClick={join}
              disabled={pending}
              className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {pending ? "Joining…" : "Join this room"}
            </button>
          ) : (
            <Link
              href={signInHref}
              className="mt-4 inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
            >
              Sign in to join
            </Link>
          )}
        </>
      )}
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
