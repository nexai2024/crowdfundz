CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subcommunity" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subcommunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityMembership" (
    "id" TEXT NOT NULL,
    "subcommunityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMembership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityComment" (
    "id" TEXT NOT NULL,
    "subcommunityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityComment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
CREATE UNIQUE INDEX "Subcommunity_campaignId_key" ON "Subcommunity"("campaignId");
CREATE INDEX "Subcommunity_communityId_idx" ON "Subcommunity"("communityId");
CREATE INDEX "CommunityMembership_userId_idx" ON "CommunityMembership"("userId");
CREATE UNIQUE INDEX "CommunityMembership_subcommunityId_userId_key" ON "CommunityMembership"("subcommunityId", "userId");
CREATE INDEX "CommunityComment_subcommunityId_createdAt_idx" ON "CommunityComment"("subcommunityId", "createdAt");

ALTER TABLE "Subcommunity" ADD CONSTRAINT "Subcommunity_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subcommunity" ADD CONSTRAINT "Subcommunity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_subcommunityId_fkey" FOREIGN KEY ("subcommunityId") REFERENCES "Subcommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_subcommunityId_fkey" FOREIGN KEY ("subcommunityId") REFERENCES "Subcommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Community" ("id", "slug", "name", "description", "createdAt")
VALUES (
    'community_crowdventure',
    'crowdventure',
    'CrowdVenture',
    'CrowdVenture is the community. Each project has its own room. Joining a room is how you join CrowdVenture.',
    CURRENT_TIMESTAMP
);

INSERT INTO "Subcommunity" ("id", "communityId", "campaignId", "createdAt")
SELECT 'room_' || "id", 'community_crowdventure', "id", CURRENT_TIMESTAMP
FROM "Campaign";
