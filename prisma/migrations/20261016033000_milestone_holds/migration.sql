-- CreateEnum
CREATE TYPE "FundingMode" AS ENUM ('INSTANT', 'MILESTONE');

-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('PENDING', 'HELD', 'RELEASING', 'RELEASED', 'REFUNDED', 'DISPUTED');

-- AlterTable
ALTER TABLE "Backer" ADD COLUMN "stripeChargeId" TEXT,
ADD COLUMN "fundingMode" "FundingMode" NOT NULL DEFAULT 'INSTANT';

-- AlterTable
ALTER TABLE "Phase" ADD COLUMN "pullRequestUrl" TEXT,
ADD COLUMN "pullRequestMergedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PledgeAllocation" (
    "id" TEXT NOT NULL,
    "backerId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "amountUsd" INTEGER NOT NULL,
    "status" "AllocationStatus" NOT NULL DEFAULT 'PENDING',
    "signedOffAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "stripeTransferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PledgeAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Backer_stripeChargeId_key" ON "Backer"("stripeChargeId");

-- CreateIndex
CREATE UNIQUE INDEX "PledgeAllocation_stripeTransferId_key" ON "PledgeAllocation"("stripeTransferId");

-- CreateIndex
CREATE INDEX "PledgeAllocation_phaseId_idx" ON "PledgeAllocation"("phaseId");

-- CreateIndex
CREATE INDEX "PledgeAllocation_backerId_idx" ON "PledgeAllocation"("backerId");

-- CreateIndex
CREATE UNIQUE INDEX "PledgeAllocation_backerId_phaseId_key" ON "PledgeAllocation"("backerId", "phaseId");

-- AddForeignKey
ALTER TABLE "PledgeAllocation" ADD CONSTRAINT "PledgeAllocation_backerId_fkey" FOREIGN KEY ("backerId") REFERENCES "Backer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PledgeAllocation" ADD CONSTRAINT "PledgeAllocation_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
