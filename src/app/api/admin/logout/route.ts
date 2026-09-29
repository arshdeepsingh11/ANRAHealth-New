import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdmin, ADMIN_COOKIE } from "@backend/adminAuth";
import { adminLog } from "@backend/adminAudit";
import { clientMeta } from "@backend/patientAuth";

export async function POST() {
  const admin = await getAdmin();
  if (admin) {
    const { ip } = await clientMeta();
    await adminLog({ actor: admin.actor, ip, kind: "Account", action: "Signed out", resource: "Admin console" });
  }
  (await cookies()).delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
