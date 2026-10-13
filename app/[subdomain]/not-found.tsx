import Link from "next/link";

export default function CreatorNotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Missing page</p>
        <h1 className="mt-3 text-3xl font-bold text-white">That creator or project is not published.</h1>
        <p className="mt-3 text-sm text-slate-400">
          Check the subdomain and the project slug. Live campaigns use the form name.project.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-emerald-400 hover:underline">
          Back to Crowdventure
        </Link>
      </div>
    </main>
  );
}
