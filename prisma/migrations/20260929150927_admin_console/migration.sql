-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "prepReviewedAt" DATETIME;
ALTER TABLE "Appointment" ADD COLUMN "staffNotes" TEXT;

-- AlterTable
ALTER TABLE "CareTeamMember" ADD COLUMN "location" TEXT;

-- AlterTable
ALTER TABLE "LabResult" ADD COLUMN "staffNote" TEXT;

-- AlterTable
ALTER TABLE "ProtocolItem" ADD COLUMN "pausedAt" DATETIME;

-- AlterTable
ALTER TABLE "ReferralSubmission" ADD COLUMN "staffNote" TEXT;

-- AlterTable
ALTER TABLE "SymptomCheckLog" ADD COLUMN "reviewedAt" DATETIME;
ALTER TABLE "SymptomCheckLog" ADD COLUMN "reviewedBy" TEXT;

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "landingPath" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "patientId" TEXT,
    "convertedAt" DATETIME,
    CONSTRAINT "Visitor_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutboundClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fromPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdminAuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Admin (shared)',
    "kind" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "subjectType" TEXT,
    "subjectId" TEXT,
    "subject" TEXT,
    "reason" TEXT,
    "before" TEXT,
    "after" TEXT,
    "ip" TEXT,
    "result" TEXT NOT NULL DEFAULT 'Success',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "phone" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Edmonton',
    "photoVersion" INTEGER NOT NULL DEFAULT 0,
    "termsAcceptedAt" DATETIME NOT NULL,
    "emailVerifiedAt" DATETIME,
    "lastLoginAt" DATETIME,
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "accountStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Patient" ("createdAt", "dateOfBirth", "email", "emailVerifiedAt", "failedLogins", "firstName", "id", "lastLoginAt", "lastName", "lockedUntil", "passwordHash", "phone", "photoVersion", "termsAcceptedAt", "timezone", "updatedAt") SELECT "createdAt", "dateOfBirth", "email", "emailVerifiedAt", "failedLogins", "firstName", "id", "lastLoginAt", "lastName", "lockedUntil", "passwordHash", "phone", "photoVersion", "termsAcceptedAt", "timezone", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_sessionId_key" ON "Visitor"("sessionId");

-- CreateIndex
CREATE INDEX "Visitor_patientId_idx" ON "Visitor"("patientId");

-- CreateIndex
CREATE INDEX "Visitor_lastSeenAt_idx" ON "Visitor"("lastSeenAt");

-- CreateIndex
CREATE INDEX "OutboundClick_createdAt_idx" ON "OutboundClick"("createdAt");

-- CreateIndex
CREATE INDEX "OutboundClick_host_createdAt_idx" ON "OutboundClick"("host", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditEvent_createdAt_idx" ON "AdminAuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditEvent_subjectId_createdAt_idx" ON "AdminAuditEvent"("subjectId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditEvent_kind_createdAt_idx" ON "AdminAuditEvent"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "ReferralSubmission_status_createdAt_idx" ON "ReferralSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SymptomCheckLog_emergency_reviewedAt_idx" ON "SymptomCheckLog"("emergency", "reviewedAt");
