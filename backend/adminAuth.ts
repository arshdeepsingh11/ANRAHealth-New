// Simple admin authentication for the internal /admin dashboard.
// Uses a signed token (HMAC) instead of a database sessions table — keeps
// this genuinely simple while still being tamper-proof: nobody can forge
// a valid token without knowing ADMIN_SESSION_SECRET.

import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.ADMIN_SESSION_SECRET || "";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function checkAdminPassword(candidate: string): boolean {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(real);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminToken(): string {
  const payload = `admin:${Date.now()}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token || !SECRET) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [payload, sig] = decoded.split(".");
    if (!payload || !sig) return false;

    const expectedSig = createHmac("sha256", SECRET).update(payload).digest("hex");
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return false;

    const timestamp = Number(payload.split(":")[1]);
    if (!timestamp || Date.now() - timestamp > THIRTY_DAYS_MS) return false;

    return true;
  } catch {
    return false;
  }
}