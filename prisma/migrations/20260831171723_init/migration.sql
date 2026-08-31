-- CreateTable
CREATE TABLE "PageVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReferralSubmission" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SymptomCheckLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "specialty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emergency" BOOLEAN NOT NULL,
    "urgency" TEXT NOT NULL,
    "recommendedDiscipline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AlbaConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "pageContext" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AlbaMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlbaMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AlbaConversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LongevityAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "answers" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "focusAreas" TEXT NOT NULL,
    "suggestedNextStep" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LabResultCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inputType" TEXT NOT NULL,
    "overallSummary" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "PageVisit_path_idx" ON "PageVisit"("path");

-- CreateIndex
CREATE INDEX "PageVisit_sessionId_idx" ON "PageVisit"("sessionId");

-- CreateIndex
CREATE INDEX "ReferralSubmission_sessionId_idx" ON "ReferralSubmission"("sessionId");

-- CreateIndex
CREATE INDEX "SymptomCheckLog_sessionId_idx" ON "SymptomCheckLog"("sessionId");

-- CreateIndex
CREATE INDEX "AlbaConversation_sessionId_idx" ON "AlbaConversation"("sessionId");

-- CreateIndex
CREATE INDEX "AlbaMessage_conversationId_idx" ON "AlbaMessage"("conversationId");

-- CreateIndex
CREATE INDEX "LongevityAssessment_sessionId_idx" ON "LongevityAssessment"("sessionId");

-- CreateIndex
CREATE INDEX "LabResultCheck_sessionId_idx" ON "LabResultCheck"("sessionId");
