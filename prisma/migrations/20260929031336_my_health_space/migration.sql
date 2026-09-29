-- CreateTable
CREATE TABLE "Patient" (
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
    "lastLoginAt" DATETIME,
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PatientSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "PatientSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientPhoto" (
    "patientId" TEXT NOT NULL PRIMARY KEY,
    "mime" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PatientPhoto_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientSettings" (
    "patientId" TEXT NOT NULL PRIMARY KEY,
    "shareWearables" BOOLEAN NOT NULL DEFAULT true,
    "shareLabs" BOOLEAN NOT NULL DEFAULT true,
    "shareRecords" BOOLEAN NOT NULL DEFAULT true,
    "albaAccess" BOOLEAN NOT NULL DEFAULT true,
    "notifDaily" BOOLEAN NOT NULL DEFAULT true,
    "notifWorth" BOOLEAN NOT NULL DEFAULT true,
    "notifProtocol" BOOLEAN NOT NULL DEFAULT true,
    "notifAppt" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PatientSettings_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Goal_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CareTeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "physicianSlug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareTeamMember_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeviceConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "tokenHash" TEXT,
    "tokenHint" TEXT,
    "dataTypes" TEXT NOT NULL DEFAULT '[]',
    "connectedAt" DATETIME,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeviceConnection_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "valueText" TEXT,
    "source" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HealthReading_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "category" TEXT NOT NULL,
    "value" REAL,
    "valueText" TEXT,
    "unit" TEXT,
    "refLow" REAL,
    "refHigh" REAL,
    "refText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'final',
    "expectedAt" DATETIME,
    "collectedAt" DATETIME,
    "source" TEXT NOT NULL DEFAULT 'BioAro Labs',
    "panel" TEXT,
    "about" TEXT,
    "guidance" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProtocolItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "timeOfDay" TEXT,
    "dose" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sections" TEXT NOT NULL DEFAULT '[]',
    "guidance" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProtocolItem_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProtocolLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "doneAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProtocolLog_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ProtocolItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProtocolLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clinician" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "summaryAvailable" BOOLEAN NOT NULL DEFAULT false,
    "rescheduleRequestedAt" DATETIME,
    "prepShareTrends" BOOLEAN NOT NULL DEFAULT true,
    "prepShareResults" BOOLEAN NOT NULL DEFAULT true,
    "prepShareSymptoms" BOOLEAN NOT NULL DEFAULT true,
    "prepSavedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VisitQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VisitQuestion_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VisitQuestion_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccessLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AlbaConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "pageContext" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    CONSTRAINT "AlbaConversation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AlbaConversation" ("createdAt", "id", "pageContext", "sessionId") SELECT "createdAt", "id", "pageContext", "sessionId" FROM "AlbaConversation";
DROP TABLE "AlbaConversation";
ALTER TABLE "new_AlbaConversation" RENAME TO "AlbaConversation";
CREATE INDEX "AlbaConversation_sessionId_idx" ON "AlbaConversation"("sessionId");
CREATE INDEX "AlbaConversation_patientId_createdAt_idx" ON "AlbaConversation"("patientId", "createdAt");
CREATE TABLE "new_LabResultCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inputType" TEXT NOT NULL,
    "overallSummary" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    CONSTRAINT "LabResultCheck_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LabResultCheck" ("createdAt", "id", "inputType", "overallSummary", "results", "sessionId") SELECT "createdAt", "id", "inputType", "overallSummary", "results", "sessionId" FROM "LabResultCheck";
DROP TABLE "LabResultCheck";
ALTER TABLE "new_LabResultCheck" RENAME TO "LabResultCheck";
CREATE INDEX "LabResultCheck_sessionId_idx" ON "LabResultCheck"("sessionId");
CREATE INDEX "LabResultCheck_patientId_createdAt_idx" ON "LabResultCheck"("patientId", "createdAt");
CREATE TABLE "new_LongevityAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "answers" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "focusAreas" TEXT NOT NULL,
    "suggestedNextStep" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    CONSTRAINT "LongevityAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LongevityAssessment" ("answers", "createdAt", "focusAreas", "id", "sessionId", "suggestedNextStep", "summary") SELECT "answers", "createdAt", "focusAreas", "id", "sessionId", "suggestedNextStep", "summary" FROM "LongevityAssessment";
DROP TABLE "LongevityAssessment";
ALTER TABLE "new_LongevityAssessment" RENAME TO "LongevityAssessment";
CREATE INDEX "LongevityAssessment_sessionId_idx" ON "LongevityAssessment"("sessionId");
CREATE INDEX "LongevityAssessment_patientId_createdAt_idx" ON "LongevityAssessment"("patientId", "createdAt");
CREATE TABLE "new_ReferralSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "patientName" TEXT,
    "patientPhone" TEXT,
    "referringPhysician" TEXT,
    "referringPhone" TEXT,
    "referringAddress" TEXT,
    "urgency" TEXT,
    "specialties" TEXT,
    "physicianSlugs" TEXT,
    "exams" TEXT,
    "clinicalNotes" TEXT,
    "sourceText" TEXT,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'received',
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "scheduledAt" DATETIME,
    CONSTRAINT "ReferralSubmission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ReferralSubmission" ("clinicalNotes", "createdAt", "exams", "id", "patientName", "patientPhone", "physicianSlugs", "referringAddress", "referringPhone", "referringPhysician", "sessionId", "sourceText", "specialties", "type", "urgency") SELECT "clinicalNotes", "createdAt", "exams", "id", "patientName", "patientPhone", "physicianSlugs", "referringAddress", "referringPhone", "referringPhysician", "sessionId", "sourceText", "specialties", "type", "urgency" FROM "ReferralSubmission";
DROP TABLE "ReferralSubmission";
ALTER TABLE "new_ReferralSubmission" RENAME TO "ReferralSubmission";
CREATE INDEX "ReferralSubmission_sessionId_idx" ON "ReferralSubmission"("sessionId");
CREATE INDEX "ReferralSubmission_patientId_createdAt_idx" ON "ReferralSubmission"("patientId", "createdAt");
CREATE TABLE "new_SymptomCheckLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "specialty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emergency" BOOLEAN NOT NULL,
    "urgency" TEXT NOT NULL,
    "recommendedDiscipline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    CONSTRAINT "SymptomCheckLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SymptomCheckLog" ("createdAt", "description", "emergency", "id", "recommendedDiscipline", "sessionId", "specialty", "summary", "urgency") SELECT "createdAt", "description", "emergency", "id", "recommendedDiscipline", "sessionId", "specialty", "summary", "urgency" FROM "SymptomCheckLog";
DROP TABLE "SymptomCheckLog";
ALTER TABLE "new_SymptomCheckLog" RENAME TO "SymptomCheckLog";
CREATE INDEX "SymptomCheckLog_sessionId_idx" ON "SymptomCheckLog"("sessionId");
CREATE INDEX "SymptomCheckLog_patientId_createdAt_idx" ON "SymptomCheckLog"("patientId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PatientSession_tokenHash_key" ON "PatientSession"("tokenHash");

-- CreateIndex
CREATE INDEX "PatientSession_patientId_idx" ON "PatientSession"("patientId");

-- CreateIndex
CREATE INDEX "PatientSession_expiresAt_idx" ON "PatientSession"("expiresAt");

-- CreateIndex
CREATE INDEX "Goal_patientId_idx" ON "Goal"("patientId");

-- CreateIndex
CREATE INDEX "CareTeamMember_patientId_idx" ON "CareTeamMember"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceConnection_tokenHash_key" ON "DeviceConnection"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceConnection_patientId_provider_key" ON "DeviceConnection"("patientId", "provider");

-- CreateIndex
CREATE INDEX "HealthReading_patientId_metric_day_idx" ON "HealthReading"("patientId", "metric", "day");

-- CreateIndex
CREATE UNIQUE INDEX "HealthReading_patientId_metric_day_source_key" ON "HealthReading"("patientId", "metric", "day", "source");

-- CreateIndex
CREATE INDEX "LabResult_patientId_code_collectedAt_idx" ON "LabResult"("patientId", "code", "collectedAt");

-- CreateIndex
CREATE INDEX "LabResult_patientId_collectedAt_idx" ON "LabResult"("patientId", "collectedAt");

-- CreateIndex
CREATE INDEX "ProtocolItem_patientId_active_idx" ON "ProtocolItem"("patientId", "active");

-- CreateIndex
CREATE INDEX "ProtocolLog_patientId_day_idx" ON "ProtocolLog"("patientId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ProtocolLog_itemId_day_key" ON "ProtocolLog"("itemId", "day");

-- CreateIndex
CREATE INDEX "Appointment_patientId_startsAt_idx" ON "Appointment"("patientId", "startsAt");

-- CreateIndex
CREATE INDEX "VisitQuestion_patientId_createdAt_idx" ON "VisitQuestion"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "AccessLog_patientId_createdAt_idx" ON "AccessLog"("patientId", "createdAt");
