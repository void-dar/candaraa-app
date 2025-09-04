/*
  Warnings:

  - You are about to drop the column `attempted` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Finance` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Finance" AS ENUM ('EARN', 'CONVERT');

-- DropForeignKey
ALTER TABLE "public"."Finance" DROP CONSTRAINT "Finance_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Finance" DROP CONSTRAINT "Finance_walletId_fkey";

-- AlterTable
ALTER TABLE "public"."Question" DROP COLUMN "attempted";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "points",
ADD COLUMN     "coins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usdt" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."Finance";

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "type" "public"."Finance" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
