ALTER TABLE "User" ADD COLUMN "subdomain" TEXT NOT NULL;
ALTER TABLE "User" ADD COLUMN "headline" TEXT;
ALTER TABLE "User" ADD COLUMN "bio" TEXT;
CREATE UNIQUE INDEX "User_subdomain_key" ON "User"("subdomain");

ALTER TABLE "Campaign" ADD COLUMN "eyebrow" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "statusLabel" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "manifestoTitle" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "manifestoQuote" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "endsAt" TIMESTAMP(3);
DROP INDEX "Campaign_slug_key";
CREATE UNIQUE INDEX "Campaign_creatorId_slug_key" ON "Campaign"("creatorId", "slug");
CREATE INDEX "Campaign_creatorId_idx" ON "Campaign"("creatorId");

CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Phase_campaignId_idx" ON "Phase"("campaignId");
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Faq_campaignId_idx" ON "Faq"("campaignId");
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Tier" ADD COLUMN "badge" TEXT;
ALTER TABLE "Tier" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Tier_campaignId_idx" ON "Tier"("campaignId");

CREATE INDEX "Backer_campaignId_idx" ON "Backer"("campaignId");
CREATE INDEX "Backer_tierId_idx" ON "Backer"("tierId");
