// Every "save this to the database" action in the app goes through one of
// these functions. Routes never touch Prisma directly — they call a
// function here instead. Keeps all database logic in one organized place.

import { prisma } from "@backend/db";

export async function logPageVisit(params: {
  path: string;
  sessionId: string;
  userAgent?: string;
  referrer?: string;
}) {
  return prisma.pageVisit.create({
    data: {
      path: params.path,
      sessionId: params.sessionId,
      userAgent: params.userAgent,
      referrer: params.referrer,
    },
  });
}

export async function logReferralSubmission(params: {
  type: "manual" | "automatic" | "scan";
  sessionId: string;
  patientName?: string;
  patientPhone?: string;
  referringPhysician?: string;
  referringPhone?: string;
  referringAddress?: string;
  urgency?: string;
  specialties?: string[];
  physicianSlugs?: string[];
  exams?: string[];
  clinicalNotes?: string;
  sourceText?: string;
}) {
  return prisma.referralSubmission.create({
    data: {
      type: params.type,
      sessionId: params.sessionId,
      patientName: params.patientName,
      patientPhone: params.patientPhone,
      referringPhysician: params.referringPhysician,
      referringPhone: params.referringPhone,
      referringAddress: params.referringAddress,
      urgency: params.urgency,
      specialties: params.specialties ? JSON.stringify(params.specialties) : undefined,
      physicianSlugs: params.physicianSlugs ? JSON.stringify(params.physicianSlugs) : undefined,
      exams: params.exams ? JSON.stringify(params.exams) : undefined,
      clinicalNotes: params.clinicalNotes,
      sourceText: params.sourceText,
    },
  });
}

export async function logSymptomCheck(params: {
  specialty: string;
  description: string;
  emergency: boolean;
  urgency: string;
  recommendedDiscipline: string;
  summary: string;
  sessionId: string;
}) {
  return prisma.symptomCheckLog.create({
    data: {
      specialty: params.specialty,
      description: params.description,
      emergency: params.emergency,
      urgency: params.urgency,
      recommendedDiscipline: params.recommendedDiscipline,
      summary: params.summary,
      sessionId: params.sessionId,
    },
  });
}

// Starts a new ALBA conversation and returns its ID, so subsequent
// messages in the same chat can be attached to it.
export async function startAlbaConversation(params: {
  sessionId: string;
  pageContext?: string;
}) {
  const conversation = await prisma.albaConversation.create({
    data: {
      sessionId: params.sessionId,
      pageContext: params.pageContext,
    },
  });
  return conversation.id;
}

export async function logAlbaMessage(params: {
  conversationId: string;
  role: "user" | "assistant";
  text: string;
}) {
  return prisma.albaMessage.create({
    data: {
      conversationId: params.conversationId,
      role: params.role,
      text: params.text,
    },
  });
}

export async function logLongevityAssessment(params: {
  answers: Record<string, any>;
  summary: string;
  focusAreas: any[];
  suggestedNextStep: string;
  sessionId: string;
}) {
  return prisma.longevityAssessment.create({
    data: {
      answers: JSON.stringify(params.answers),
      summary: params.summary,
      focusAreas: JSON.stringify(params.focusAreas),
      suggestedNextStep: params.suggestedNextStep,
      sessionId: params.sessionId,
    },
  });
}

export async function logLabResultCheck(params: {
  inputType: "text" | "image";
  overallSummary: string;
  results: any[];
  sessionId: string;
}) {
  return prisma.labResultCheck.create({
    data: {
      inputType: params.inputType,
      overallSummary: params.overallSummary,
      results: JSON.stringify(params.results),
      sessionId: params.sessionId,
    },
  });
}