/*
  Warnings:

  - You are about to drop the column `current` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `goals` table. All the data in the column will be lost.
  - Added the required column `targetValue` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED', 'ERROR');

-- AlterEnum
ALTER TYPE "IntegrationProvider" ADD VALUE 'LOSE_IT';

-- AlterTable
ALTER TABLE "goals" DROP COLUMN "current",
DROP COLUMN "target",
DROP COLUMN "unit",
ADD COLUMN     "startValue" DOUBLE PRECISION,
ADD COLUMN     "targetValue" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "goals_userId_type_status_idx" ON "goals"("userId", "type", "status");
