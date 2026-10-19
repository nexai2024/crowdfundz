import type { Metadata } from "next";
import Link from "next/link";
import { getCommunityHub } from "@/lib/community";
import { getSessionUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community — CrowdVenture",
  description: "The CrowdVenture community and the project rooms inside it. Joining a project room makes you a member.",
};

export default async function CommunityPage() {
  const userId = await getSessionUserId();
  const hub = await getCommunityHub(userId);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">Community</p>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-white">{hub.name}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">{hub.description}</p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
        There is no separate signup for the main community. Opt in to a project room, and you are in CrowdVenture.
        Leaving your last room is how you leave the main community. Comments stay on the room.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full border border-slate-800 px-3 py-1 text-slate-300">
          {hub.memberCount} {hub.memberCount === 1 ? "member" : "members"}
        </span>
        <span className="rounded-full border border-slate-800 px-3 py-1 text-slate-300">
          {hub.roomCount} {hub.roomCount === 1 ? "project room" : "project rooms"}
        </span>
        {hub.joined ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
            You are a member
          </span>
        ) : null}
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-white">Project rooms</h2>
        <p className="mt-2 text-sm text-slate-500">A room is created with every project. Membership is opt-in.</p>
        {hub.rooms.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No public projects yet.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {hub.rooms.map((room) => (
              <li key={room.href}>
                <Link
                  href={room.href}
                  className="block h-full rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-emerald-500/40"
                >
                  <p className="font-mono text-[11px] text-slate-500">
                    {room.subdomain}/{room.slug}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-white">{room.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{room.tagline}</p>
                  <p className="mt-4 text-xs text-slate-500">
                    {room.memberCount} {room.memberCount === 1 ? "member" : "members"} · {room.commentCount}{" "}
                    {room.commentCount === 1 ? "comment" : "comments"}
                    {room.joined ? " · Joined" : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl font-bold text-white">Recent comments</h2>
        {hub.recentComments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Comments show up here after someone posts in a project room.</p>
        ) : (
          <ol className="mt-6 space-y-4">
            {hub.recentComments.map((comment) => (
              <li key={comment.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{comment.authorName}</p>
                  <Link href={comment.href} className="text-xs text-emerald-300 hover:text-emerald-200">
                    {comment.roomTitle}
                  </Link>
                </div>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {comment.body}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
