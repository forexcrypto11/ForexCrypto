/*
  Warnings:

  - You are about to drop the column `currencyPair` on the `LoanRequest` table. All the data in the column will be lost.
  - You are about to drop the column `leverage` on the `LoanRequest` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `LoanRequest` table. All the data in the column will be lost.
  - The `status` column on the `LoanRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `duration` to the `LoanRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "LoanRequest" DROP COLUMN "currencyPair",
DROP COLUMN "leverage",
DROP COLUMN "purpose",
ADD COLUMN     "duration" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "LoanStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "LoanRequestStatus";
