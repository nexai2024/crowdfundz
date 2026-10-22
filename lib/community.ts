import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isReservedSubdomain } from "@/lib/subdomain";
import { consumeRateLimit } from "@/lib/waitlist-rate-limit";

export const MAIN_COMMUNITY_SLUG = "crowdventure";

const COMMENT_LIMIT = 100;

export class CommunityError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type CommunityCommentView = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
};

export type ProjectRoom = {
  communityName: string;
  title: string;
  tagline: string;
  subdomain: string;
  slug: string;
  href: string;
  memberCount: number;
  commentCount: number;
  joined: boolean;
  signedIn: boolean;
  comments: CommunityCommentView[];
};

export type CommunityHubRoom = {
  title: string;
  tagline: string;
  subdomain: string;
  slug: string;
  href: string;
  memberCount: number;
  commentCount: number;
  joined: boolean;
};

export type CommunityHub = {
  name: string;
  description: string;
  memberCount: number;
  roomCount: number;
  joined: boolean;
  signedIn: boolean;
  rooms: CommunityHubRoom[];
  recentComments: Array<CommunityCommentView & { roomTitle: string; href: string }>;
};

export function allowCommunityAttempt(ip: string) {
  return consumeRateLimit("community", ip, 20, 10 * 60 * 1000);
}

export async function ensureMainCommunity() {
  return prisma.community.upsert({
    where: { slug: MAIN_COMMUNITY_SLUG },
    update: {},
    create: {
      slug: MAIN_COMMUNITY_SLUG,
      name: "CrowdVenture",
      description:
        "CrowdVenture is the community. Each project has its own room. Joining a room is how you join CrowdVenture.",
    },
  });
}

export async function ensureProjectSubcommunity(campaignId: string) {
  const existing = await prisma.subcommunity.findUnique({ where: { campaignId } });
  if (existing) return existing;

  const community = await ensureMainCommunity();
  try {
    return await prisma.subcommunity.create({
      data: { campaignId, communityId: community.id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const raced = await prisma.subcommunity.findUnique({ where: { campaignId } });
      if (raced) return raced;
    }
    throw error;
  }
}

function authorName(user: { name: string | null; subdomain: string | null }) {
  const name = user.name?.trim();
  if (name) return name;
  if (user.subdomain) return user.subdomain;
  return "Member";
}

async function findCampaign(subdomain: string, slug: string) {
  if (!subdomain || !slug || isReservedSubdomain(subdomain)) return null;
  const creator = await prisma.user.findUnique({
    where: { subdomain },
    select: { id: true },
  });
  if (!creator) return null;
  return prisma.campaign.findUnique({
    where: { creatorId_slug: { creatorId: creator.id, slug } },
    select: { id: true, title: true, tagline: true, slug: true },
  });
}

export async function getRoomInvite(subdomain: string, slug: string, userId: string | null) {
  const campaign = await findCampaign(subdomain, slug);
  if (!campaign) return null;
  const subcommunity = await ensureProjectSubcommunity(campaign.id);
  const membership = userId
    ? await prisma.communityMembership.findUnique({
        where: { subcommunityId_userId: { subcommunityId: subcommunity.id, userId } },
        select: { id: true },
      })
    : null;
  return {
    title: campaign.title,
    subdomain,
    slug: campaign.slug,
    href: `/community/${subdomain}/${campaign.slug}`,
    joined: Boolean(membership),
    signedIn: Boolean(userId),
  };
}

export async function getProjectRoom(
  subdomain: string,
  slug: string,
  userId: string | null
): Promise<ProjectRoom | null> {
  const campaign = await findCampaign(subdomain, slug);
  if (!campaign) return null;

  const subcommunity = await ensureProjectSubcommunity(campaign.id);
  const [memberCount, commentCount, membership, comments, community] = await Promise.all([
    prisma.communityMembership.count({ where: { subcommunityId: subcommunity.id } }),
    prisma.communityComment.count({ where: { subcommunityId: subcommunity.id } }),
    userId
      ? prisma.communityMembership.findUnique({
          where: { subcommunityId_userId: { subcommunityId: subcommunity.id, userId } },
          select: { id: true },
        })
      : Promise.resolve(null),
    prisma.communityComment.findMany({
      where: { subcommunityId: subcommunity.id },
      orderBy: { createdAt: "desc" },
      take: COMMENT_LIMIT,
      select: {
        id: true,
        body: true,
        createdAt: true,
        user: { select: { name: true, subdomain: true } },
      },
    }),
    prisma.community.findUnique({
      where: { id: subcommunity.communityId },
      select: { name: true },
    }),
  ]);

  return {
    communityName: community?.name ?? "CrowdVenture",
    title: campaign.title,
    tagline: campaign.tagline,
    subdomain,
    slug: campaign.slug,
    href: `/community/${subdomain}/${campaign.slug}`,
    memberCount,
    commentCount,
    joined: Boolean(membership),
    signedIn: Boolean(userId),
    comments: comments.reverse().map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      authorName: authorName(comment.user),
    })),
  };
}

export async function getCommunityHub(userId: string | null): Promise<CommunityHub> {
  const community = await ensureMainCommunity();
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE", creator: { subdomain: { not: null } } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      tagline: true,
      slug: true,
      creator: { select: { subdomain: true } },
      subcommunity: { select: { id: true } },
    },
  });

  for (const campaign of campaigns) {
    if (!campaign.subcommunity) await ensureProjectSubcommunity(campaign.id);
  }

  const rooms = await prisma.subcommunity.findMany({
    where: { communityId: community.id, campaign: { status: "ACTIVE" } },
    orderBy: { campaign: { createdAt: "desc" } },
    select: {
      id: true,
      _count: { select: { members: true, comments: true } },
      members: userId ? { where: { userId }, select: { id: true }, take: 1 } : false,
      campaign: {
        select: {
          title: true,
          tagline: true,
          slug: true,
          creator: { select: { subdomain: true } },
        },
      },
    },
  });

  const visible = rooms.flatMap((room) => {
    const subdomain = room.campaign.creator.subdomain;
    if (!subdomain) return [];
    return [
      {
        title: room.campaign.title,
        tagline: room.campaign.tagline,
        subdomain,
        slug: room.campaign.slug,
        href: `/community/${subdomain}/${room.campaign.slug}`,
        memberCount: room._count.members,
        commentCount: room._count.comments,
        joined: Array.isArray(room.members) && room.members.length > 0,
      },
    ];
  });

  const [members, recent] = await Promise.all([
    prisma.communityMembership.groupBy({
      by: ["userId"],
      where: { subcommunity: { communityId: community.id } },
    }),
    prisma.communityComment.findMany({
      where: { subcommunity: { communityId: community.id } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        body: true,
        createdAt: true,
        user: { select: { name: true, subdomain: true } },
        subcommunity: {
          select: {
            campaign: {
              select: { title: true, slug: true, creator: { select: { subdomain: true } } },
            },
          },
        },
      },
    }),
  ]);

  return {
    name: community.name,
    description: community.description,
    memberCount: members.length,
    roomCount: visible.length,
    joined: visible.some((room) => room.joined),
    signedIn: Boolean(userId),
    rooms: visible,
    recentComments: recent.flatMap((comment) => {
      const subdomain = comment.subcommunity.campaign.creator.subdomain;
      if (!subdomain) return [];
      return [
        {
          id: comment.id,
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
          authorName: authorName(comment.user),
          roomTitle: comment.subcommunity.campaign.title,
          href: `/community/${subdomain}/${comment.subcommunity.campaign.slug}`,
        },
      ];
    }),
  };
}

async function requireRoom(subdomain: string, slug: string) {
  const campaign = await findCampaign(subdomain, slug);
  if (!campaign) throw new CommunityError("That project room was not found.", 404);
  const subcommunity = await ensureProjectSubcommunity(campaign.id);
  return { campaign, subcommunity };
}

export async function joinProjectRoom(userId: string, subdomain: string, slug: string) {
  const { subcommunity } = await requireRoom(subdomain, slug);
  await prisma.communityMembership.upsert({
    where: { subcommunityId_userId: { subcommunityId: subcommunity.id, userId } },
    update: {},
    create: { subcommunityId: subcommunity.id, userId },
  });
  const memberCount = await prisma.communityMembership.count({ where: { subcommunityId: subcommunity.id } });
  return { joined: true, inMainCommunity: true, memberCount };
}

export async function leaveProjectRoom(userId: string, subdomain: string, slug: string) {
  const { subcommunity } = await requireRoom(subdomain, slug);
  await prisma.communityMembership.deleteMany({
    where: { subcommunityId: subcommunity.id, userId },
  });
  const memberCount = await prisma.communityMembership.count({ where: { subcommunityId: subcommunity.id } });
  const stillInCommunity = await prisma.communityMembership.findFirst({
    where: { userId, subcommunity: { communityId: subcommunity.communityId } },
    select: { id: true },
  });
  return { joined: false, inMainCommunity: Boolean(stillInCommunity), memberCount };
}

export async function addProjectComment(userId: string, subdomain: string, slug: string, rawBody: string) {
  const body = rawBody.trim();
  if (body.length < 1 || body.length > 2000) {
    throw new CommunityError("Write a comment between 1 and 2000 characters.", 400);
  }

  const { subcommunity } = await requireRoom(subdomain, slug);
  const membership = await prisma.communityMembership.findUnique({
    where: { subcommunityId_userId: { subcommunityId: subcommunity.id, userId } },
    select: { id: true },
  });
  if (!membership) {
    throw new CommunityError("Join this project room before commenting.", 403);
  }

  const comment = await prisma.communityComment.create({
    data: { subcommunityId: subcommunity.id, userId, body },
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: { select: { name: true, subdomain: true } },
    },
  });

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    authorName: authorName(comment.user),
  };
}
