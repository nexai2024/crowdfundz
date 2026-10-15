-- CreateTable
CREATE TABLE "BuildMetric" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "commitsCount" INTEGER NOT NULL DEFAULT 0,
    "weeklyGrowth" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'VSCode Extension',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeUpdate" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "editor" TEXT NOT NULL DEFAULT 'VS Code',
    "commitHash" TEXT,
    "commitMessage" TEXT NOT NULL,
    "linesAdded" INTEGER NOT NULL DEFAULT 0,
    "linesDeleted" INTEGER NOT NULL DEFAULT 0,
    "fileChanged" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoSandbox" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sandboxUrl" TEXT NOT NULL,
    "embedCode" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'Node.js / React',
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoSandbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernancePoll" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "options" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernancePoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "backerEmail" TEXT NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernanceVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bounty" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rewardUsd" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BountySubmission" (
    "id" TEXT NOT NULL,
    "bountyId" TEXT NOT NULL,
    "contributorName" TEXT NOT NULL,
    "contributorEmail" TEXT NOT NULL,
    "submissionUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BountySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCheck" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "disclaimerVerified" BOOLEAN NOT NULL DEFAULT true,
    "kycStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "jurisdiction" TEXT NOT NULL DEFAULT 'US-DELAWARE',
    "taxFormFiled" BOOLEAN NOT NULL DEFAULT true,
    "lastAuditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorSlot" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "sponsorName" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "tierName" TEXT NOT NULL DEFAULT 'Gold Sponsor',
    "amountPaidUsd" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationLoop" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "partnerSubdomain" TEXT NOT NULL,
    "partnerSlug" TEXT NOT NULL,
    "partnerTitle" TEXT NOT NULL,
    "discountPercentage" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationLoop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilestonePaywall" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredRaisedUsd" INTEGER NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MilestonePaywall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuildMetric_campaignId_idx" ON "BuildMetric"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "IdeApiKey_key_key" ON "IdeApiKey"("key");

-- CreateIndex
CREATE INDEX "IdeUpdate_campaignId_idx" ON "IdeUpdate"("campaignId");

-- CreateIndex
CREATE INDEX "DemoSandbox_campaignId_idx" ON "DemoSandbox"("campaignId");

-- CreateIndex
CREATE INDEX "GovernancePoll_campaignId_idx" ON "GovernancePoll"("campaignId");

-- CreateIndex
CREATE INDEX "GovernanceVote_pollId_idx" ON "GovernanceVote"("pollId");

-- CreateIndex
CREATE INDEX "Bounty_campaignId_idx" ON "Bounty"("campaignId");

-- CreateIndex
CREATE INDEX "BountySubmission_bountyId_idx" ON "BountySubmission"("bountyId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceCheck_campaignId_key" ON "ComplianceCheck"("campaignId");

-- CreateIndex
CREATE INDEX "SponsorSlot_campaignId_idx" ON "SponsorSlot"("campaignId");

-- CreateIndex
CREATE INDEX "CollaborationLoop_campaignId_idx" ON "CollaborationLoop"("campaignId");

-- CreateIndex
CREATE INDEX "MilestonePaywall_campaignId_idx" ON "MilestonePaywall"("campaignId");

-- AddForeignKey
ALTER TABLE "BuildMetric" ADD CONSTRAINT "BuildMetric_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeUpdate" ADD CONSTRAINT "IdeUpdate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoSandbox" ADD CONSTRAINT "DemoSandbox_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernancePoll" ADD CONSTRAINT "GovernancePoll_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceVote" ADD CONSTRAINT "GovernanceVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "GovernancePoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BountySubmission" ADD CONSTRAINT "BountySubmission_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "Bounty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorSlot" ADD CONSTRAINT "SponsorSlot_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationLoop" ADD CONSTRAINT "CollaborationLoop_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestonePaywall" ADD CONSTRAINT "MilestonePaywall_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
