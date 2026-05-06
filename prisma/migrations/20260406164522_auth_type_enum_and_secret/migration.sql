/*
  Warnings:

  - The `authType` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('LOCAL', 'STREAMER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authType",
ADD COLUMN     "authType" "AuthType" NOT NULL DEFAULT 'LOCAL';

-- CreateTable
CREATE TABLE "Secret" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireAt" TIMESTAMP(3),
    "encrypted_key" TEXT,

    CONSTRAINT "Secret_pkey" PRIMARY KEY ("id")
);
