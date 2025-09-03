-- CreateEnum
CREATE TYPE "public"."Region" AS ENUM ('AFRICA', 'EUROPE');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'USER', 'GUEST');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "region" "public"."Region" NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'GUEST',
    "level" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "walletId" UUID NOT NULL,
    "walletAddress" TEXT,
    "userId" UUID NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("walletId")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT[],
    "prompt" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attempted" INTEGER DEFAULT 0,
    "authorId" UUID NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Finance" (
    "id" UUID NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "crypto" JSONB NOT NULL DEFAULT '{}',
    "userId" UUID NOT NULL,
    "walletId" UUID,

    CONSTRAINT "Finance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_walletAddress_key" ON "public"."Wallet"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "public"."Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Finance_userId_key" ON "public"."Finance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Finance_walletId_key" ON "public"."Finance"("walletId");

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Finance" ADD CONSTRAINT "Finance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Finance" ADD CONSTRAINT "Finance_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("walletId") ON DELETE SET NULL ON UPDATE CASCADE;
