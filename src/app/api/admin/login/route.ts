// POST /api/admin/login { identifier, password } — shared clinic password
// (Phase 1). The identifier names the staff member in the audit log.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminPassword, createAdminToken, cleanActor, ADMIN_COOKIE, ADMIN_SESSION_HOURS } from "@backend/adminAuth";
import { adminLog } from "@backend/adminAudit";
import { assertSameOrigin, clientMeta } from "@backend/patientAuth";
import { rateLimit } from "@backend/rateLimit";
import { readJson, toResponse, HttpError } from "@backend/apiHelpers";

export async function POST(req: Request) {
  try {
    await assertSameOrigin();
    const { ip } = await clientMeta();
    if (!rateLimit(`admin-login:${ip}`, 10, 15 * 60 * 1000)) throw new HttpError(429, "Too many attempts. Please wait 15 minutes.");
    const b = await readJson(req);
    const actor = cleanActor(b.identifier);
    if (!b.identifier || typeof b.identifier !== "string" || !b.identifier.trim()) throw new HttpError(400, "Enter your email or admin identifier.");
    if (typeof b.password !== "string" || !b.password) throw new HttpError(400, "Enter the admin password.");
    if (!checkAdminPassword(b.password)) {
      await adminLog({ actor: "unknown", ip, kind: "Account", action: "Failed sign-in", resource: "Admin console", subject: actor, result: "Denied" });
      throw new HttpError(401, "That password isn't right.");
    }
    (await cookies()).set(ADMIN_COOKIE, createAdminToken(actor), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_HOURS * 60 * 60,
    });
    await adminLog({ actor, ip, kind: "Account", action: "Signed in", resource: "Admin console" });
    return NextResponse.json({ ok: true, actor });
  } catch (e) {
    return toResponse(e);
  }
}
