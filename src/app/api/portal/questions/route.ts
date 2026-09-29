// POST   /api/portal/questions        { text } — add a "question to ask" at the next visit
// DELETE /api/portal/questions?id=…   — remove one
import { prisma } from "@backend/db";
import { audit } from "@backend/audit";
import { withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";

export const POST = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const text = str((await readJson(req)).text, 300);
  if (!text) throw new HttpError(400, "Please type a question.");
  const count = await prisma.visitQuestion.count({ where: { patientId: patient.id, appointmentId: null } });
  if (count >= 30) throw new HttpError(400, "That's a lot of questions — please remove some first.");
  const dup = await prisma.visitQuestion.findFirst({ where: { patientId: patient.id, text }, select: { id: true } });
  const q = dup ?? (await prisma.visitQuestion.create({ data: { patientId: patient.id, text }, select: { id: true } }));
  audit(patient.id, "patient", "create", "visit-question", ip);
  return { id: q.id, text, duplicate: !!dup };
});

export const DELETE = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const id = (new URL(req.url).searchParams.get("id") || "").slice(0, 40);
  await prisma.visitQuestion.deleteMany({ where: { id, patientId: patient.id } });
  audit(patient.id, "patient", "delete", "visit-question", ip);
  return { ok: true };
});
