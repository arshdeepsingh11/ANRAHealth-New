// POST /api/admin/action { action, …fields } — staff changes from the admin
// console. Same-origin + staff sign-in required; every action is audited.

import { NextResponse } from "next/server";
import { requireAdmin, checkAdminPassword } from "@backend/adminAuth";
import { adminLog } from "@backend/adminAudit";
import { assertSameOrigin, clientMeta } from "@backend/patientAuth";
import { rateLimit } from "@backend/rateLimit";
import { readJson, toResponse, HttpError, NO_STORE } from "@backend/apiHelpers";
import { runAction } from "@backend/adminActions";

export async function POST(req: Request) {
  try {
    await assertSameOrigin();
    const { actor } = await requireAdmin();
    const { ip } = await clientMeta();
    if (!rateLimit(`admin-action:${ip}`, 240, 60 * 1000)) throw new HttpError(429, "Too many requests. Please wait a moment.");
    const b = await readJson(req, 100_000);

    // Unlocking an idle-locked console re-checks the shared password.
    if (b.action === "session.unlock") {
      if (!rateLimit(`admin-unlock:${ip}`, 10, 15 * 60 * 1000)) throw new HttpError(429, "Too many attempts. Please wait a few minutes.");
      const ok = typeof b.password === "string" && checkAdminPassword(b.password);
      await adminLog({ actor, ip, kind: "Account", action: ok ? "Unlocked session" : "Failed unlock", resource: "Admin console", result: ok ? "Success" : "Denied" });
      if (!ok) throw new HttpError(401, "That password isn't right.");
      return NextResponse.json({ ok: true }, { headers: NO_STORE });
    }

    const result = await runAction(b, { actor, ip });
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (e) {
    return toResponse(e);
  }
}
