"use client";

import { useState } from "react";
import Link from "next/link";
import type { CommunityCommentView, ProjectRoom } from "@/lib/community";

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function CommunityRoom({
  room,
  compact = false,
}: {
  room: ProjectRoom;
  compact?: boolean;
}) {
  const [joined, setJoined] = useState(room.joined);
  const [memberCount, setMemberCount] = useState(room.memberCount);
  const [comments, setComments] = useState<CommunityCommentView[]>(room.comments);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"join" | "leave" | "comment" | null>(null);

  const visible = compact ? comments.slice(-5) : comments;

  async function changeMembership(action: "join" | "leave") {
    setError("");
    setPending(action);
    try {
      const response = await fetch("/api/community/join", {
        method: action === "join" ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: room.subdomain, slug: room.slug }),
      });
      const data = (await response.json()) as { error?: string; joined?: boolean; memberCount?: number };
      if (!response.ok) {
        setError(data.error || "Could not update your membership.");
        return;
      }
      setJoined(Boolean(data.joined));
      if (typeof data.memberCount === "number") setMemberCount(data.memberCount);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(null);
    }
  }

  async function postComment() {
    setError("");
    const text = draft.trim();
    if (text.length < 1 || text.length > 2000) {
      setError("Write a comment between 1 and 2000 characters.");
      return;
    }
    setPending("comment");
    try {
      const response = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: room.subdomain, slug: room.slug, body: text }),
      });
      const data = (await response.json()) as CommunityCommentView & { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not post that comment.");
        return;
      }
      setComments((current) => [...current, { id: data.id, body: data.body, createdAt: data.createdAt, authorName: data.authorName }]);
      setDraft("");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section id="community" className="scroll-mt-24 border-t border-slate-900 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">{room.communityName} community</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">{room.title}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {memberCount} {memberCount === 1 ? "member" : "members"} in this room
            </p>
          </div>
          {compact ? (
            <Link href={room.href} className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
              Open the room
            </Link>
          ) : (
            <Link href="/community" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
              All project rooms
            </Link>
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          This is the {room.title} room inside the CrowdVenture community. Joining this room is how you join the main
          community. Comments here are public. Posting requires membership.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!room.signedIn ? (
            <Link
              href="/account"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
            >
              Sign in to join
            </Link>
          ) : joined ? (
            <button
              type="button"
              onClick={() => changeMembership("leave")}
              disabled={pending !== null}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500 disabled:opacity-60"
            >
              {pending === "leave" ? "Leaving…" : "Leave this room"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => changeMembership("join")}
              disabled={pending !== null}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {pending === "join" ? "Joining…" : "Join this room"}
            </button>
          )}
          {joined ? <span className="text-sm text-emerald-300">You are in the CrowdVenture community.</span> : null}
        </div>

        <ol className="mt-8 space-y-4">
          {visible.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-slate-800 px-4 py-6 text-sm text-slate-500">
              No comments yet. Members can start the thread.
            </li>
          ) : (
            visible.map((comment) => (
              <li key={comment.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{comment.authorName}</p>
                  <time className="font-mono text-[11px] text-slate-500" dateTime={comment.createdAt}>
                    {formatWhen(comment.createdAt)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{comment.body}</p>
              </li>
            ))
          )}
        </ol>

        {compact && comments.length > visible.length ? (
          <p className="mt-4 text-sm text-slate-500">
            Showing the latest {visible.length}.{" "}
            <Link href={room.href} className="text-emerald-300 hover:text-emerald-200">
              Read the full thread
            </Link>
          </p>
        ) : null}

        {joined ? (
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              void postComment();
            }}
          >
            <label className="block text-sm text-slate-300">
              Comment
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={4}
                maxLength={2000}
                className="mt-1.5 w-full resize-y rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-white outline-hidden focus:border-emerald-500/60"
              />
            </label>
            <button
              type="submit"
              disabled={pending !== null}
              className="mt-3 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {pending === "comment" ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-slate-500">Join this room to comment.</p>
        )}
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </div>
    </section>
  );
}
