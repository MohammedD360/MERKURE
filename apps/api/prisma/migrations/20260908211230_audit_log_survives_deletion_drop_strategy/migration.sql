/*
  Warnings:

  - You are about to drop the `strategies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_performedBy_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "performedBy" DROP NOT NULL;

-- DropTable
DROP TABLE "strategies";

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
