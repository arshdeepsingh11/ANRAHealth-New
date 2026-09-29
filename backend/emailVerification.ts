// 6-digit email verification codes.
// • crypto-random code, only its SHA-256 (salted with the patient id) stored
// • 10-minute expiry, 5 wrong attempts burn the code
// • a new code invalidates older ones; resend limited to 1/minute and 5/hour
// • verified accounts can't be re-verified (no-op)

import { createHash, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "@backend/db";
import { sendMail, codeEmail } from "@backend/email";
import { HttpError } from "@backend/patientAuth";

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 60 * 1000;
const PER_HOUR = 5;

const hashCode = (patientId: string, code: string) => createHash("sha256").update(`${patientId}:${code}`).digest("hex");

/** Seconds until another code may be sent (0 = now). */
export async function resendWaitSeconds(patientId: string): Promise<number> {
  const last = await prisma.emailCode.findFirst({ where: { patientId, purpose: "verify" }, orderBy: { createdAt: "desc" }, select: { createdAt: true } });
  if (!last) return 0;
  return Math.max(0, Math.ceil((last.createdAt.getTime() + COOLDOWN_MS - Date.now()) / 1000));
}

export async function hasActiveCode(patientId: string): Promise<boolean> {
  const c = await prisma.emailCode.findFirst({ where: { patientId, purpose: "verify", usedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: MAX_ATTEMPTS } }, select: { id: true } });
  return !!c;
}

export async function sendVerificationCode(p: { id: string; email: string; firstName: string }) {
  const wait = await resendWaitSeconds(p.id);
  if (wait > 0) throw new HttpError(429, `Please wait ${wait} seconds before requesting another code.`);
  const hourCount = await prisma.emailCode.count({ where: { patientId: p.id, purpose: "verify", createdAt: { gt: new Date(Date.now() - 3600_000) } } });
  if (hourCount >= PER_HOUR) throw new HttpError(429, "Too many codes requested. Please try again in an hour.");

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.$transaction([
    prisma.emailCode.updateMany({ where: { patientId: p.id, purpose: "verify", usedAt: null }, data: { usedAt: new Date() } }),
    prisma.emailCode.create({ data: { patientId: p.id, purpose: "verify", codeHash: hashCode(p.id, code), expiresAt: new Date(Date.now() + TTL_MS) } }),
  ]);
  try {
    await sendMail({ to: p.email, ...codeEmail(p.firstName, code) });
  } catch (e: any) {
    console.error("Verification email failed:", e?.message);
    throw new HttpError(502, "We couldn't send the email right now. Please try again in a minute.");
  }
}

export async function confirmVerificationCode(patientId: string, code: string): Promise<void> {
  if (!/^\d{6}$/.test(code)) throw new HttpError(400, "Enter the 6-digit code from your email.");
  const row = await prisma.emailCode.findFirst({
    where: { patientId, purpose: "verify", usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.attempts >= MAX_ATTEMPTS) throw new HttpError(400, "This code has expired. Request a new one.");
  const ok = timingSafeEqual(Buffer.from(row.codeHash, "hex"), Buffer.from(hashCode(patientId, code), "hex"));
  if (!ok) {
    const attempts = row.attempts + 1;
    await prisma.emailCode.update({ where: { id: row.id }, data: { attempts } });
    const left = MAX_ATTEMPTS - attempts;
    throw new HttpError(400, left > 0 ? `That code isn't right. ${left} attempt${left === 1 ? "" : "s"} left.` : "Too many wrong attempts. Request a new code.");
  }
  await prisma.$transaction([
    prisma.emailCode.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.patient.update({ where: { id: patientId }, data: { emailVerifiedAt: new Date() } }),
  ]);
}
