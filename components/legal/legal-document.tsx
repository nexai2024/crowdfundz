import Link from "next/link";
import type { ReactNode } from "react";

export const POLICY_UPDATED = "October 19, 2026";

export function LegalDocument({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">{kicker}</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">{title}</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated {POLICY_UPDATED}</p>
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-300 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
      <nav className="mt-12 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
        <Link href="/legal/privacy" className="hover:text-emerald-300">
          Privacy policy
        </Link>
        <Link href="/legal/terms" className="hover:text-emerald-300">
          Terms of service
        </Link>
        <Link href="/legal/abandoned-projects" className="hover:text-emerald-300">
          Abandoned projects
        </Link>
      </nav>
    </article>
  );
}
