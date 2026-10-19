import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityRoom } from "@/components/community/community-room";
import { getProjectRoom } from "@/lib/community";
import { getSessionUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ subdomain: string; slug: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const room = await getProjectRoom(params.subdomain, params.slug, null).catch(() => null);
  if (!room) return { title: "Project room not found" };
  return {
    title: `${room.title} room — CrowdVenture`,
    description: `The ${room.title} room in the CrowdVenture community.`,
  };
}

export default async function ProjectRoomPage(props: PageProps) {
  const params = await props.params;
  const userId = await getSessionUserId();
  const room = await getProjectRoom(params.subdomain, params.slug, userId).catch((error) => {
    console.error("ProjectRoomPage: could not load room", error);
    return null;
  });
  if (!room) notFound();

  return <CommunityRoom room={room} />;
}
