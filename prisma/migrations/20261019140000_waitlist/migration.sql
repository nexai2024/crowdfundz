-- Rollback: prisma/migrations/20261019140000_waitlist/down.sql

CREATE TYPE "WaitlistStatus" AS ENUM ('pending', 'approved', 'rejected', 'promoted');

CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL DEFAULT 'waitlist',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");
CREATE INDEX "waitlist_status_created_at_idx" ON "waitlist"("status", "created_at");
