import { redirect } from "next/navigation";
import { getCurrentPatient } from "@backend/patientAuth";
import AuthForm from "@/components/portal/AuthForm";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const p = await getCurrentPatient();
  if (p) redirect(p.emailVerified ? "/my-health" : "/my-health/verify");
  return <AuthForm mode="sign-in" />;
}
