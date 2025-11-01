-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('WEIGHT_LOSS', 'WEIGHT_GAIN', 'STEPS', 'EXERCISE', 'SLEEP', 'WATER', 'CALORIES', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('GOOGLE_FIT', 'FITBIT', 'APPLE_HEALTH', 'STRAVA', 'MYFITNESSPAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "googleId" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "steps" INTEGER,
    "calories" INTEGER,
    "sleep" DOUBLE PRECISION,
    "water" DOUBLE PRECISION,
    "exercise" INTEGER,
    "heartRate" INTEGER,
    "notes" TEXT,
    "mood" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "GoalType" NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "current" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "health_data_userId_date_idx" ON "health_data"("userId", "date");

-- CreateIndex
CREATE INDEX "goals_userId_status_idx" ON "goals"("userId", "status");

-- CreateIndex
CREATE INDEX "integrations_userId_isActive_idx" ON "integrations"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_userId_provider_key" ON "integrations"("userId", "provider");

-- AddForeignKey
ALTER TABLE "health_data" ADD CONSTRAINT "health_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
