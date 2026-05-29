-- AddColumn: email verification fields on users
ALTER TABLE "merkure"."users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "merkure"."users" ADD COLUMN "emailVerifyToken" TEXT;
CREATE UNIQUE INDEX "users_emailVerifyToken_key" ON "merkure"."users"("emailVerifyToken");
