import { redirect } from "next/navigation";
import { getCurrentPatient } from "@backend/patientAuth";
import AuthForm from "@/components/portal/AuthForm";

export const dynamic = "force-dynamic";

// Public sign-up is controlled by PORTAL_SIGNUP_OPEN (set "false" before
// real patients use the portal, until the HIA Privacy Impact Assessment clears).
export default async function SignUpPage() {
  const p = await getCurrentPatient();
  if (p) redirect(p.emailVerified ? "/my-health" : "/my-health/verify");
  return <AuthForm mode="sign-up" signupOpen={process.env.PORTAL_SIGNUP_OPEN !== "false"} />;
}
