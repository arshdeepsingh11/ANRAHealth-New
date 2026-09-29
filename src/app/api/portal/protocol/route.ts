// GET  /api/portal/protocol — today's routine + consistency streak
// POST /api/portal/protocol — { itemId, done } check / uncheck for today
import { prisma } from "@backend/db";
import { getProtocol } from "@backend/patientData";
import { audit } from "@backend/audit";
import { dayKey } from "@/lib/portal/metrics";
import { withPatient, withPatientMutation, readJson, str, HttpError } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient, ip }) => {
  audit(patient.id, "patient", "read", "protocol", ip);
  return getProtocol(patient);
});

export const POST = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const b = await readJson(req);
  const itemId = str(b.itemId, 40);
  const item = await prisma.protocolItem.findFirst({ where: { id: itemId, patientId: patient.id, active: true }, select: { id: true } });
  if (!item) throw new HttpError(404, "Protocol step not found.");
  const day = dayKey(new Date(), patient.timezone);
  if (b.done === true) {
    await prisma.protocolLog.upsert({ where: { itemId_day: { itemId, day } }, create: { itemId, day, patientId: patient.id }, update: {} });
  } else {
    await prisma.protocolLog.deleteMany({ where: { itemId, day, patientId: patient.id } });
  }
  audit(patient.id, "patient", "update", `protocol:${itemId}`, ip);
  return getProtocol(patient);
});
