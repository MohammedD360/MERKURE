-- AlterTable
ALTER TABLE "broker_accounts" ADD COLUMN     "providerAccountId" TEXT;

-- CreateIndex
CREATE INDEX "broker_accounts_providerAccountId_idx" ON "broker_accounts"("providerAccountId");
