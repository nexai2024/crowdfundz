ALTER TABLE "Backer" ADD COLUMN "stripeTransferId" TEXT;
ALTER TABLE "PledgeAllocation" ADD COLUMN "cardFeeCents" INTEGER;

CREATE UNIQUE INDEX "Backer_stripeTransferId_key" ON "Backer"("stripeTransferId");
