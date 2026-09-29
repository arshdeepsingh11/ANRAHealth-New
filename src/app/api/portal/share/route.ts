// GET    /api/portal/share — my share-with-doctor links
// POST   /api/portal/share — { label, scope: [trends|bp|labs|lifestyle], days: 1|7|30 }
// DELETE /api/portal/share?id= — turn a link off
import { listShares, createShare, revokeShare } from "@backend/social";
import { baseUrl } from "@backend/oauth";
import { audit } from "@backend/audit";
import { withPatient, withPatientMutation, readJson, str } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient }) => listShares(patient));

export const POST = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const b = await readJson(req);
  const link = await createShare(patient, str(b.label, 80), Array.isArray(b.scope) ? b.scope.map(String) : [], Number(b.days), baseUrl(req));
  audit(patient.id, "patient", "create", `share:${link.id}`, ip);
  return { link, links: await listShares(patient) };
});

export const DELETE = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const id = (new URL(req.url).searchParams.get("id") || "").slice(0, 40);
  await revokeShare(patient, id);
  audit(patient.id, "patient", "delete", `share:${id}`, ip);
  return listShares(patient);
});
