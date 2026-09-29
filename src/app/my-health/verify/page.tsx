// /my-health/verify — confirm email ownership with a 6-digit code before
// any health data is available.
import { redirect } from "next/navigation";
import { getCurrentPatient } from "@backend/patientAuth";
import { hasActiveCode, resendWaitSeconds } from "@backend/emailVerification";
import { emailConfigured } from "@backend/email";
import VerifyEmail from "@/components/portal/VerifyEmail";

export const dynamic = "force-dynamic";

const mask = (email: string) => {
  const [u, d] = email.split("@");
  return (u.length <= 2 ? u[0] + "•" : u.slice(0, 2) + "•".repeat(Math.min(6, u.length - 2))) + "@" + d;
};

export default async function VerifyPage() {
  const p = await getCurrentPatient();
  if (!p) redirect("/my-health/sign-in");
  if (p.emailVerified) redirect("/my-health");
  const [active, wait] = await Promise.all([hasActiveCode(p.id), resendWaitSeconds(p.id)]);
  return <VerifyEmail maskedEmail={mask(p.email)} needsCode={!active && wait === 0} initialWait={wait} devMode={!emailConfigured() && process.env.NODE_ENV !== "production"} />;
}
