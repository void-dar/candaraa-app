-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('GUEST', 'EASY', 'MEDIUM', 'HARD');

-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'PREMIUM';

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "difficulty" "public"."Difficulty"[] DEFAULT ARRAY['EASY']::"public"."Difficulty"[],
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
