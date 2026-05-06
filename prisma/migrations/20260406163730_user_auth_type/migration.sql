-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authType" TEXT NOT NULL DEFAULT 'LOCAL';

-- CreateTable
CREATE TABLE "PublicUser" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "PublicUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicUser_username_key" ON "PublicUser"("username");
