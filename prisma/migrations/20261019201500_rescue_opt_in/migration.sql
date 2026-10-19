CREATE TYPE "RescueRole" AS ENUM ('backer', 'maker');

CREATE TABLE "rescue_opt_in" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "RescueRole" NOT NULL,
    "project" TEXT,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rescue_opt_in_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rescue_opt_in_email_idx" ON "rescue_opt_in"("email");
