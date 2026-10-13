import PlatformHome from "@/components/platform-home";
import { getPlatformProjects } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let projects: Awaited<ReturnType<typeof getPlatformProjects>> = [];
  try {
    projects = await getPlatformProjects();
  } catch (error) {
    console.error("HomePage: could not load live campaigns", error);
  }

  return <PlatformHome projects={projects} />;
}
