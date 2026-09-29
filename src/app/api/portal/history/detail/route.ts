// GET /api/portal/history/detail?type=symptom|alba|assessment|labcheck&id=…
import { getHistoryDetail } from "@backend/patientData";
import { audit } from "@backend/audit";
import { withPatient, HttpError } from "@backend/apiHelpers";

export const GET = (req: Request) => withPatient(async ({ patient, ip }) => {
  const u = new URL(req.url);
  const type = u.searchParams.get("type") || "", id = (u.searchParams.get("id") || "").slice(0, 40);
  const d = await getHistoryDetail(patient, type, id);
  if (!d) throw new HttpError(404, "Not found.");
  audit(patient.id, "patient", "read", `history:${type}:${id}`, ip);
  return d;
});
