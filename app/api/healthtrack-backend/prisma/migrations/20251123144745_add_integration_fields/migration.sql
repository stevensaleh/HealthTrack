-- AlterTable
ALTER TABLE "integrations" ADD COLUMN     "credentials" JSONB,
ADD COLUMN     "status" "IntegrationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "syncErrorMessage" TEXT;
