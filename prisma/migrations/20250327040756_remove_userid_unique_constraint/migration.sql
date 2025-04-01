-- This is an empty migration.

-- DropIndex
DROP INDEX "LoanRequest_userId_key";

-- AlterTable
ALTER TABLE "LoanRequest" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "userId" SET DATA TYPE TEXT;