-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "repoUrl" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "repoBranch" TEXT DEFAULT 'main';
ALTER TABLE "Campaign" ADD COLUMN "ideEditor" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "vercelProjectUrl" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "productionUrl" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "previewUrl" TEXT;

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'DOING', 'DONE');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "phaseId" TEXT,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_campaignId_idx" ON "Task"("campaignId");
CREATE INDEX "Task_phaseId_idx" ON "Task"("phaseId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
