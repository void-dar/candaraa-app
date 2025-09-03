/*
  Warnings:

  - Made the column `walletAddress` on table `Wallet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Wallet" ALTER COLUMN "walletAddress" SET NOT NULL;
