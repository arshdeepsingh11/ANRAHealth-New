import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@backend/session";
import { logReferralSubmission } from "@backend/logging";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    type, patientName, patientPhone, referringPhysician, referringPhone,
    referringAddress, urgency, specialties, physicianSlugs, exams,
    clinicalNotes, sourceText,
  } = body || {};

  if (!type || !["manual", "automatic", "scan"].includes(type)) {
    return NextResponse.json({ error: "Missing or invalid type" }, { status: 400 });
  }

  try {
    const sessionId = await getOrCreateSessionId();
    await logReferralSubmission({
      type,
      sessionId,
      patientName,
      patientPhone,
      referringPhysician,
      referringPhone,
      referringAddress,
      urgency,
      specialties,
      physicianSlugs,
      exams,
      clinicalNotes,
      sourceText,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to log referral submission:", err);
    // Never let logging failures affect the patient's actual PDF download.
    return NextResponse.json({ ok: false });
  }
}