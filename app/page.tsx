import MarketingHome from "@/components/marketing-home";
import { getPlatformProjects } from "@/lib/campaigns";
import { getSessionUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let projects: Awaited<ReturnType<typeof getPlatformProjects>> = [];
  try {
    projects = await getPlatformProjects();
  } catch (error) {
    console.error("HomePage: could not load live campaigns", error);
  }

  const user = await getSessionUser().catch(() => null);
  return <MarketingHome projects={projects} signedIn={Boolean(user)} />;
}
