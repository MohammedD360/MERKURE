-- AlterTable: Trade.userId → ON DELETE CASCADE
-- Nécessaire pour que la suppression d'un User (via Clerk webhook) supprime ses trades.

ALTER TABLE "trades" DROP CONSTRAINT IF EXISTS "trades_userId_fkey";
ALTER TABLE "trades" ADD CONSTRAINT "trades_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
