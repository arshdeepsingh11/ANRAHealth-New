-- AlterTable
ALTER TABLE "DeviceConnection" ADD COLUMN "accessTokenEnc" TEXT;
ALTER TABLE "DeviceConnection" ADD COLUMN "externalUserId" TEXT;
ALTER TABLE "DeviceConnection" ADD COLUMN "lastError" TEXT;
ALTER TABLE "DeviceConnection" ADD COLUMN "refreshTokenEnc" TEXT;
ALTER TABLE "DeviceConnection" ADD COLUMN "tokenExpiresAt" DATETIME;

-- CreateTable
CREATE TABLE "BpReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "sys" INTEGER NOT NULL,
    "dia" INTEGER NOT NULL,
    "pulse" INTEGER,
    "takenAt" DATETIME NOT NULL,
    "day" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BpReading_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LifestyleLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "note" TEXT,
    "day" TEXT NOT NULL,
    "at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LifestyleLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CareLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "caregiverId" TEXT,
    "email" TEXT NOT NULL,
    "relation" TEXT NOT NULL DEFAULT 'Family',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "inviteHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    CONSTRAINT "CareLink_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CareLink_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT '[]',
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShareLink_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "goal" REAL NOT NULL,
    "startDay" TEXT NOT NULL,
    "endDay" TEXT NOT NULL,
    "org" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Challenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChallengeMember" (
    "challengeId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("challengeId", "patientId"),
    CONSTRAINT "ChallengeMember_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChallengeMember_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RewardEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "code" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardEvent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "emailedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PatientSettings" (
    "patientId" TEXT NOT NULL PRIMARY KEY,
    "shareWearables" BOOLEAN NOT NULL DEFAULT true,
    "shareLabs" BOOLEAN NOT NULL DEFAULT true,
    "shareRecords" BOOLEAN NOT NULL DEFAULT true,
    "albaAccess" BOOLEAN NOT NULL DEFAULT true,
    "notifDaily" BOOLEAN NOT NULL DEFAULT true,
    "notifWorth" BOOLEAN NOT NULL DEFAULT true,
    "notifProtocol" BOOLEAN NOT NULL DEFAULT true,
    "notifAppt" BOOLEAN NOT NULL DEFAULT true,
    "city" TEXT,
    "province" TEXT,
    "lat" REAL,
    "lon" REAL,
    "briefEmail" BOOLEAN NOT NULL DEFAULT false,
    "leaderboardName" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PatientSettings_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PatientSettings" ("albaAccess", "notifAppt", "notifDaily", "notifProtocol", "notifWorth", "patientId", "shareLabs", "shareRecords", "shareWearables", "updatedAt") SELECT "albaAccess", "notifAppt", "notifDaily", "notifProtocol", "notifWorth", "patientId", "shareLabs", "shareRecords", "shareWearables", "updatedAt" FROM "PatientSettings";
DROP TABLE "PatientSettings";
ALTER TABLE "new_PatientSettings" RENAME TO "PatientSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BpReading_patientId_day_idx" ON "BpReading"("patientId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "BpReading_patientId_takenAt_source_key" ON "BpReading"("patientId", "takenAt", "source");

-- CreateIndex
CREATE INDEX "LifestyleLog_patientId_day_idx" ON "LifestyleLog"("patientId", "day");

-- CreateIndex
CREATE INDEX "LifestyleLog_patientId_kind_day_idx" ON "LifestyleLog"("patientId", "kind", "day");

-- CreateIndex
CREATE UNIQUE INDEX "CareLink_inviteHash_key" ON "CareLink"("inviteHash");

-- CreateIndex
CREATE INDEX "CareLink_ownerId_idx" ON "CareLink"("ownerId");

-- CreateIndex
CREATE INDEX "CareLink_caregiverId_idx" ON "CareLink"("caregiverId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_tokenHash_key" ON "ShareLink"("tokenHash");

-- CreateIndex
CREATE INDEX "ShareLink_patientId_idx" ON "ShareLink"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_code_key" ON "Challenge"("code");

-- CreateIndex
CREATE INDEX "ChallengeMember_patientId_idx" ON "ChallengeMember"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardEvent_code_key" ON "RewardEvent"("code");

-- CreateIndex
CREATE INDEX "RewardEvent_patientId_createdAt_idx" ON "RewardEvent"("patientId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RewardEvent_patientId_kind_day_key" ON "RewardEvent"("patientId", "kind", "day");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedNote_patientId_kind_period_key" ON "GeneratedNote"("patientId", "kind", "period");
