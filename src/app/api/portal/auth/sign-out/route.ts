// POST /api/portal/auth/sign-out
import { NextResponse } from "next/server";
import { destroySession, getCurrentPatient, assertSameOrigin, clientMeta } from "@backend/patientAuth";
import { audit } from "@backend/audit";
import { toResponse } from "@backend/apiHelpers";

export async function POST() {
  try {
    await assertSameOrigin();
    const p = await getCurrentPatient();
    await destroySession();
    if (p) audit(p.id, "patient", "logout", "session", (await clientMeta()).ip);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return toResponse(e);
  }
}
