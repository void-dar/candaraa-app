/*
  Warnings:

  - You are about to alter the column `coins` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "coins" SET DEFAULT 0.00,
ALTER COLUMN "coins" SET DATA TYPE DECIMAL(10,2);
