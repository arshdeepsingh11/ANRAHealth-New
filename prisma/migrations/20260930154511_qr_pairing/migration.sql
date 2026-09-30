-- AlterTable
ALTER TABLE "DeviceConnection" ADD COLUMN "lastAttemptAt" DATETIME;
ALTER TABLE "DeviceConnection" ADD COLUMN "lastResult" TEXT;

-- CreateTable
CREATE TABLE "DevicePairing" (
    "codeHash" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DevicePairing_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DevicePairing_patientId_idx" ON "DevicePairing"("patientId");
