import { redirect } from "next/navigation";
import { getCurrentPatient } from "@backend/patientAuth";
import AuthForm from "@/components/portal/AuthForm";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if (await getCurrentPatient()) redirect("/my-health");
  return <AuthForm mode="sign-in" />;
}
