import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CampaignLanding from "@/components/campaign-landing";
import { getCampaignLanding } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ subdomain: string; slug: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const campaign = await getCampaignLanding(params.subdomain, params.slug).catch(() => null);
  if (!campaign) return { title: "Project not found" };
  return {
    title: `${campaign.title} — ${campaign.creatorName}`,
    description: campaign.tagline,
  };
}

export default async function CampaignPage(props: PageProps) {
  const params = await props.params;
  const campaign = await getCampaignLanding(params.subdomain, params.slug).catch((error) => {
    console.error("CampaignPage: could not load project", error);
    return null;
  });

  if (!campaign) notFound();

  return <CampaignLanding campaign={campaign} />;
}
