// Anonymous visitor records.
//
// Every browser gets an anra_session_id cookie (backend/session.ts). The
// first time we see it we create a Visitor row with a short public ID
// ("v_7Q2K9X") that staff see in the admin console — the cookie value itself
// never leaves the server. When the visitor signs up or signs in to My Health
// Space, linkVisitorToPatient() attaches the visitor and merges their
// anonymous activity into the patient record ("Before sign-up").

import { randomInt } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@backend/db";

const SESSION_COOKIE_NAME = "anra_session_id";
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I

export function newVisitorId(): string {
  let s = "v_";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

/** Create the visitor if new; optionally count a page view. Never throws. */
export async function touchVisitor(sessionId: string, opts: { path?: string; referrer?: string; userAgent?: string; pageView?: boolean } = {}) {
  if (!sessionId) return;
  try {
    const now = new Date();
    const existing = await prisma.visitor.findUnique({ where: { sessionId }, select: { id: true } });
    if (existing) {
      await prisma.visitor.update({
        where: { sessionId },
        data: { lastSeenAt: now, ...(opts.pageView ? { pageCount: { increment: 1 } } : {}), ...(opts.userAgent ? { userAgent: opts.userAgent.slice(0, 300) } : {}) },
      });
      return;
    }
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        await prisma.visitor.create({
          data: {
            id: newVisitorId(), sessionId, firstSeenAt: now, lastSeenAt: now, pageCount: opts.pageView ? 1 : 0,
            landingPath: opts.path?.slice(0, 300), referrer: opts.referrer?.slice(0, 300), userAgent: opts.userAgent?.slice(0, 300),
          },
        });
        return;
      } catch (e: any) {
        if (e?.code !== "P2002") throw e;
        // Unique clash: either another request created this session's row, or the random ID collided.
        if (await prisma.visitor.findUnique({ where: { sessionId }, select: { id: true } })) return;
      }
    }
  } catch (e: any) {
    console.error("Visitor tracking failed:", e?.message);
  }
}

/** The current browser's anonymous session ID, without creating one. */
export async function currentSessionId(): Promise<string | null> {
  try {
    return (await cookies()).get(SESSION_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Attach this browser's visitor record to a patient and move its anonymous
 * activity into the patient record. A visitor already linked to a different
 * patient (shared computer) is left alone, so nobody inherits someone else's
 * history. Never throws — sign-in must not fail because of this.
 */
export async function linkVisitorToPatient(sessionId: string | null, patientId: string) {
  if (!sessionId) return;
  try {
    await touchVisitor(sessionId);
    const v = await prisma.visitor.findUnique({ where: { sessionId }, select: { id: true, patientId: true } });
    if (!v) return;
    if (v.patientId && v.patientId !== patientId) return;
    if (!v.patientId) await prisma.visitor.update({ where: { sessionId }, data: { patientId, convertedAt: new Date() } });
    const where = { sessionId, patientId: null };
    const data = { patientId };
    await prisma.$transaction([
      prisma.symptomCheckLog.updateMany({ where, data }),
      prisma.albaConversation.updateMany({ where, data }),
      prisma.longevityAssessment.updateMany({ where, data }),
      prisma.labResultCheck.updateMany({ where, data }),
      prisma.referralSubmission.updateMany({ where, data }),
    ]);
  } catch (e: any) {
    console.error("Visitor merge failed:", e?.message);
  }
}

/**
 * Activity recorded before visitor records existed has a sessionId but no
 * Visitor row. Create the missing rows (oldest first, in batches) so every
 * anonymous person appears in the console.
 */
export async function backfillVisitors(limit = 400) {
  const known = new Set((await prisma.visitor.findMany({ select: { sessionId: true } })).map((v) => v.sessionId));
  const firstSeen = new Map<string, { at: Date; path?: string; ua?: string | null; ref?: string | null; pages: number }>();
  const add = (sid: string, at: Date, extra: { path?: string; ua?: string | null; ref?: string | null; page?: boolean } = {}) => {
    if (!sid || known.has(sid)) return;
    const cur = firstSeen.get(sid);
    if (!cur) firstSeen.set(sid, { at, path: extra.path, ua: extra.ua, ref: extra.ref, pages: extra.page ? 1 : 0 });
    else {
      if (at < cur.at) Object.assign(cur, { at, path: extra.path ?? cur.path, ref: extra.ref ?? cur.ref });
      if (extra.page) cur.pages++;
    }
  };
  const [pv, sc, al, la, lc, rf] = await Promise.all([
    prisma.pageVisit.findMany({ select: { sessionId: true, createdAt: true, path: true, userAgent: true, referrer: true }, orderBy: { createdAt: "asc" }, take: 20000 }),
    prisma.symptomCheckLog.findMany({ select: { sessionId: true, createdAt: true } }),
    prisma.albaConversation.findMany({ select: { sessionId: true, createdAt: true } }),
    prisma.longevityAssessment.findMany({ select: { sessionId: true, createdAt: true } }),
    prisma.labResultCheck.findMany({ select: { sessionId: true, createdAt: true } }),
    prisma.referralSubmission.findMany({ select: { sessionId: true, createdAt: true } }),
  ]);
  pv.forEach((x) => add(x.sessionId, x.createdAt, { path: x.path, ua: x.userAgent, ref: x.referrer, page: true }));
  [...sc, ...al, ...la, ...lc, ...rf].forEach((x) => add(x.sessionId, x.createdAt));
  const lastSeen = new Map<string, Date>();
  [...pv, ...sc, ...al, ...la, ...lc, ...rf].forEach((x) => { const c = lastSeen.get(x.sessionId); if (!c || x.createdAt > c) lastSeen.set(x.sessionId, x.createdAt); });
  let made = 0;
  for (const [sessionId, f] of firstSeen) {
    if (made >= limit) break;
    try {
      await prisma.visitor.create({
        data: { id: newVisitorId(), sessionId, firstSeenAt: f.at, lastSeenAt: lastSeen.get(sessionId) || f.at, pageCount: f.pages, landingPath: f.path, referrer: f.ref ?? undefined, userAgent: f.ua ?? undefined },
      });
      made++;
    } catch { /* ID clash or race — picked up next time */ }
  }
  return made;
}
