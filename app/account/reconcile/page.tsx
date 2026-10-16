import Link from "next/link";
import { notFound } from "next/navigation";
import { ReconcileTool } from "@/components/reconcile-tool";
import { getSessionUser } from "@/lib/current-user";
import { isPlatformAdmin } from "@/lib/platform-admin";

export const dynamic = "force-dynamic";

export default async function PlatformReconcilePage() {
  const user = await getSessionUser();
  if (!user) notFound();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/account" className="font-mono text-sm text-slate-400 hover:text-emerald-400">
          Back to studio
        </Link>
        <p className="mt-10 text-xs font-mono uppercase tracking-wider text-emerald-400">Platform</p>
        <h1 className="mt-3 text-4xl font-extrabold text-white">Reconcile pledges</h1>
        {isPlatformAdmin(user.email) ? (
          <div className="mt-8">
            <ReconcileTool
              scope="platform"
              title="All studios"
              detail="Compare every studio with Stripe. Paid Checkout sessions that never reached the webhook are recorded, missing instant payouts are sent, and any campaign with a Stripe pledge has its total set to the confirmed pledges."
            />
          </div>
        ) : (
          <p className="mt-6 max-w-xl text-sm text-slate-400">
            Platform reconcile is limited to operator emails listed in PLATFORM_ADMIN_EMAILS. Your studio
            reconcile on the account page covers the projects on your subdomain.
          </p>
        )}
      </div>
    </main>
  );
}
