-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';
ALTER TYPE "PaymentStatus" ADD VALUE 'DISPUTED';

-- AlterTable
ALTER TABLE "Backer" ADD COLUMN "entitledAt" TIMESTAMP(3),
ADD COLUMN "stripePaymentIntentId" TEXT;

CREATE UNIQUE INDEX "Backer_stripePaymentIntentId_key" ON "Backer"("stripePaymentIntentId");

-- One confirmed backer email can vote once on a poll.
CREATE UNIQUE INDEX "GovernanceVote_pollId_backerEmail_key" ON "GovernanceVote"("pollId", "backerEmail");

-- New compliance rows start unverified. Existing rows keep their current values.
ALTER TABLE "ComplianceCheck" ALTER COLUMN "disclaimerVerified" SET DEFAULT false;
ALTER TABLE "ComplianceCheck" ALTER COLUMN "kycStatus" SET DEFAULT 'UNVERIFIED';
ALTER TABLE "ComplianceCheck" ALTER COLUMN "jurisdiction" SET DEFAULT 'UNSET';
ALTER TABLE "ComplianceCheck" ALTER COLUMN "taxFormFiled" SET DEFAULT false;
