// Admin console authentication (Phase 1: one shared clinic password).
//
// The token is an HMAC-signed "admin:<issuedAt>:<actor>" string, so nobody
// can forge one without ADMIN_SESSION_SECRET. The actor is the email or
// identifier the staff member typed at sign-in — it names them in the audit
// log until individual staff accounts arrive (Phase 2).

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { HttpError } from "@backend/patientAuth";

const SECRET = process.env.ADMIN_SESSION_SECRET || "";
export const ADMIN_COOKIE = "admin_token";
export const ADMIN_SESSION_HOURS = 12; // one clinic day; the console also locks after 15 min idle
const MAX_AGE_MS = ADMIN_SESSION_HOURS * 60 * 60 * 1000;

export function checkAdminPassword(candidate: string): boolean {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(real);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Staff identifier: trimmed, lower-cased, safe characters only. */
export function cleanActor(v: unknown): string {
  const s = typeof v === "string" ? v.trim().toLowerCase().replace(/[^a-z0-9@._+-]/g, "").slice(0, 80) : "";
  return s || "admin";
}

export function createAdminToken(actor = "admin"): string {
  const payload = `admin:${Date.now()}:${Buffer.from(cleanActor(actor)).toString("base64url")}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

/** Returns the signed-in staff identifier, or null if the token is missing, forged or expired. */
export function readAdminToken(token: string | undefined | null): { actor: string } | null {
  if (!token || !SECRET || token.length > 600) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const dot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, dot), sig = decoded.slice(dot + 1);
    if (!payload || !sig) return null;
    const expected = Buffer.from(createHmac("sha256", SECRET).update(payload).digest("hex"));
    const got = Buffer.from(sig);
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
    const [kind, ts, actorB64] = payload.split(":");
    const issued = Number(ts);
    if (kind !== "admin" || !issued || Date.now() - issued > MAX_AGE_MS) return null;
    return { actor: actorB64 ? cleanActor(Buffer.from(actorB64, "base64url").toString("utf-8")) : "admin" };
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  return readAdminToken(token) !== null;
}

export async function getAdmin(): Promise<{ actor: string } | null> {
  return readAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Route guard: throws 401 when no valid admin session. */
export async function requireAdmin(): Promise<{ actor: string }> {
  const a = await getAdmin();
  if (!a) throw new HttpError(401, "Admin sign-in required.");
  return a;
}
