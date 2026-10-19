-- Keep the existing quoted "User" table. Only add the empty DevTools table.
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE TABLE "devtoolsUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devtoolsUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "devtoolsUser_userId_key" ON "devtoolsUser"("userId");
CREATE UNIQUE INDEX "devtoolsUser_email_key" ON "devtoolsUser"("email");

ALTER TABLE "devtoolsUser" ADD CONSTRAINT "devtoolsUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
