import Link from "next/link";
import { redirect } from "next/navigation";
import ProjectStudio from "@/components/project-studio";
import { getSessionUserId } from "@/lib/current-user";
import { getStudioProject } from "@/lib/studio";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { slug: string };
};

export default async function StudioProjectPage({ params }: PageProps) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/account");

  const project = await getStudioProject(userId, params.slug);
  if (!project) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
        <div className="mx-auto max-w-xl">
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">Studio</p>
          <h1 className="mt-3 text-3xl font-bold text-white">That project is not in this studio.</h1>
          <Link href="/account" className="mt-6 inline-block text-sm font-semibold text-emerald-400 hover:underline">
            Back to your projects
          </Link>
        </div>
      </main>
    );
  }

  return <ProjectStudio project={project} />;
}
