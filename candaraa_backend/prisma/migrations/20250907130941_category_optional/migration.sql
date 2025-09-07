/*
  Warnings:

  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "public"."Question" ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Transaction" ALTER COLUMN "amount" SET DEFAULT 0.00,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);
