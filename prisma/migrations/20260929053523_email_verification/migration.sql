-- AlterTable
ALTER TABLE "Patient" ADD COLUMN "emailVerifiedAt" DATETIME;

-- CreateTable
CREATE TABLE "EmailCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailCode_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EmailCode_patientId_purpose_createdAt_idx" ON "EmailCode"("patientId", "purpose", "createdAt");
