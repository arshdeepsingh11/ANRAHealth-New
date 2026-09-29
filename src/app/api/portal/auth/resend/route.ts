// POST /api/portal/auth/resend — email a new 6-digit verification code.
import { NextResponse } from "next/server";
import { requirePatient, assertSameOrigin } from "@backend/patientAuth";
import { sendVerificationCode } from "@backend/emailVerification";
import { toResponse } from "@backend/apiHelpers";

export async function POST() {
  try {
    await assertSameOrigin();
    const p = await requirePatient({ allowUnverified: true });
    if (p.emailVerified) return NextResponse.json({ ok: true, verified: true });
    await sendVerificationCode(p);
    return NextResponse.json({ ok: true, wait: 60 });
  } catch (e) { return toResponse(e); }
}
