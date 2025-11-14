/*
  Warnings:

  - The values [WATER,CALORIES,CUSTOM] on the enum `GoalType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GoalType_new" AS ENUM ('WEIGHT_LOSS', 'WEIGHT_GAIN', 'STEPS', 'EXERCISE', 'CALORIES_INTAKE', 'CALORIES_BURN', 'SLEEP', 'WATER_INTAKE');
ALTER TABLE "goals" ALTER COLUMN "type" TYPE "GoalType_new" USING ("type"::text::"GoalType_new");
ALTER TYPE "GoalType" RENAME TO "GoalType_old";
ALTER TYPE "GoalType_new" RENAME TO "GoalType";
DROP TYPE "public"."GoalType_old";
COMMIT;
