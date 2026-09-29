// /my-health — the patient portal. Server-renders the first screen's data
// (profile, Today, settings) so the page is ready on first paint; the other
// tabs load in the background from /api/portal/*.
import { redirect } from "next/navigation";
import { getCurrentPatient, clientMeta } from "@backend/patientAuth";
import { getProfile, getToday, getSettings } from "@backend/patientData";
import { audit } from "@backend/audit";
import PortalApp from "@/components/portal/PortalApp";
import { parseRoute } from "@/lib/portal/route";

export const dynamic = "force-dynamic";

export default async function MyHealthPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/my-health/sign-in");
  if (!patient.emailVerified) redirect("/my-health/verify");
  const [profile, today, settings] = await Promise.all([getProfile(patient.id), getToday(patient), getSettings(patient.id)]);
  audit(patient.id, "patient", "read", "portal", (await clientMeta()).ip);
  return <PortalApp boot={{ profile, today, settings }} initialRoute={parseRoute(await searchParams)} />;
}
