import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CreatorHome from "@/components/creator-home";
import { getCreatorHome } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { subdomain: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const creator = await getCreatorHome(params.subdomain).catch(() => null);
  if (!creator) return { title: "Creator not found" };
  return {
    title: `${creator.name} — Crowdventure`,
    description: creator.headline,
  };
}

export default async function SubdomainPage({ params }: PageProps) {
  const creator = await getCreatorHome(params.subdomain).catch((error) => {
    console.error("SubdomainPage: could not load creator", error);
    return null;
  });

  if (!creator) notFound();

  return <CreatorHome creator={creator} />;
}
