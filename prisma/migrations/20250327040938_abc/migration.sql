/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `LoanRequest` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `LoanRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LoanRequest" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LoanRequest_userId_key" ON "LoanRequest"("userId");
