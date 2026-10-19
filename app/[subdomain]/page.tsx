import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CreatorHome from "@/components/creator-home";
import { getCreatorHome } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ subdomain: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const creator = await getCreatorHome(params.subdomain).catch(() => null);
  if (!creator) return { title: "Creator not found" };
  return {
    title: `${creator.name} — Crowdventure`,
    description: creator.headline,
  };
}

export default async function SubdomainPage(props: PageProps) {
  const params = await props.params;
  const creator = await getCreatorHome(params.subdomain).catch((error) => {
    console.error("SubdomainPage: could not load creator", error);
    return null;
  });

  if (!creator) notFound();

  return <CreatorHome creator={creator} />;
}
