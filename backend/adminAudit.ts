// Staff audit trail for the admin console (Alberta HIA). Append-only: there
// is no update or delete path anywhere in the code. Events about a patient
// are mirrored into that patient's AccessLog as actor "admin".

import { prisma } from "@backend/db";
import { audit, type AuditAction } from "@backend/audit";

export type AdminEventKind = "View" | "Reveal" | "Change" | "Export" | "Account";

export interface AdminEvent {
  actor: string;
  kind: AdminEventKind;
  action: string; // "Added lab result"
  resource: string; // "Lab · LDL cholesterol"
  subjectType?: "patient" | "visitor" | "referral";
  subjectId?: string | null;
  subject?: string | null; // display label
  reason?: string;
  before?: string;
  after?: string;
  ip?: string;
  result?: "Success" | "Denied";
}

const cut = (s: string | null | undefined, n: number) => (s ? s.slice(0, n) : null);

const MIRROR: Record<AdminEventKind, AuditAction> = { View: "read", Reveal: "read", Change: "update", Export: "export", Account: "update" };

export async function adminLog(e: AdminEvent) {
  try {
    await prisma.adminAuditEvent.create({
      data: {
        actor: cut(e.actor, 80) || "admin",
        role: e.result === "Denied" && e.actor === "unknown" ? "—" : "Admin (shared)",
        kind: e.kind,
        action: cut(e.action, 120)!,
        resource: cut(e.resource, 200)!,
        subjectType: e.subjectType ?? null,
        subjectId: cut(e.subjectId, 60),
        subject: cut(e.subject, 120),
        reason: cut(e.reason, 300),
        before: cut(e.before, 300),
        after: cut(e.after, 300),
        ip: cut(e.ip, 60),
        result: e.result || "Success",
      },
    });
    if (e.subjectType === "patient" && e.subjectId) audit(e.subjectId, "admin", MIRROR[e.kind], `${e.action}: ${e.resource}`, e.ip);
  } catch (err: any) {
    // An audit failure must be visible in the server log, never silent.
    console.error("Admin audit write failed:", err?.message);
  }
}
