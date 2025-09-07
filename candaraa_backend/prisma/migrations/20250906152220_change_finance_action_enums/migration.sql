/*
  Warnings:

  - The values [CONVERT] on the enum `FinanceAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."FinanceAction_new" AS ENUM ('EARN', 'WITHDRAW');
ALTER TABLE "public"."Transaction" ALTER COLUMN "type" TYPE "public"."FinanceAction_new" USING ("type"::text::"public"."FinanceAction_new");
ALTER TYPE "public"."FinanceAction" RENAME TO "FinanceAction_old";
ALTER TYPE "public"."FinanceAction_new" RENAME TO "FinanceAction";
DROP TYPE "public"."FinanceAction_old";
COMMIT;
