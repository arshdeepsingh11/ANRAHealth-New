// Every "save this to the database" action in the app goes through one of
// these functions. Routes never touch Prisma directly — they call a
// function here instead. Keeps all database logic in one organized place.

import { prisma } from "@backend/db";
import { currentPatientIdSafe } from "@backend/patientAuth";
import { touchVisitor } from "@backend/visitors";

// When the visitor is signed in to My Health Space, their activity is also
// linked to their patient record (so it appears in their History tab).
// Anonymous visitors are unaffected: patientId stays null.

export async function logPageVisit(params: {
  path: string;
  sessionId: string;
  userAgent?: string;
  referrer?: string;
}) {
  await touchVisitor(params.sessionId, { path: params.path, referrer: params.referrer, userAgent: params.userAgent, pageView: true });
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
  await touchVisitor(params.sessionId);
  return prisma.referralSubmission.create({
    data: {
      patientId: await currentPatientIdSafe(),
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
  await touchVisitor(params.sessionId);
  return prisma.symptomCheckLog.create({
    data: {
      patientId: await currentPatientIdSafe(),
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

// Starts a new Neyu conversation and returns its ID, so subsequent
// messages in the same chat can be attached to it.
export async function startAlbaConversation(params: {
  sessionId: string;
  pageContext?: string;
}) {
  await touchVisitor(params.sessionId);
  const conversation = await prisma.albaConversation.create({
    data: {
      patientId: await currentPatientIdSafe(),
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
  await touchVisitor(params.sessionId);
  return prisma.longevityAssessment.create({
    data: {
      patientId: await currentPatientIdSafe(),
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
  await touchVisitor(params.sessionId);
  return prisma.labResultCheck.create({
    data: {
      patientId: await currentPatientIdSafe(),
      inputType: params.inputType,
      overallSummary: params.overallSummary,
      results: JSON.stringify(params.results),
      sessionId: params.sessionId,
    },
  });
}

// A click from our site to another site (partner links, maps, etc.).
export async function logOutboundClick(params: { sessionId: string; url: string; fromPath?: string }) {
  let u: URL;
  try { u = new URL(params.url); } catch { return; }
  if (!/^https?:$/.test(u.protocol)) return;
  return prisma.outboundClick.create({
    data: { sessionId: params.sessionId, host: u.hostname.replace(/^www\./, "").slice(0, 120), url: (u.origin + u.pathname).slice(0, 300), fromPath: params.fromPath?.slice(0, 200) },
  });
}
