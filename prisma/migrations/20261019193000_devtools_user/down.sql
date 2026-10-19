ALTER TABLE "devtoolsUser" DROP CONSTRAINT "devtoolsUser_userId_fkey";
DROP TABLE "devtoolsUser";
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
