// GET  /api/portal/rewards — points, streak, history, BioAro discount tiers
// POST /api/portal/rewards — { points: 500|1000|2000 } redeem for a BioAro discount code
import { randomBytes } from "crypto";
import { prisma } from "@backend/db";
import { getRewards } from "@backend/universe";
import { balance, evaluateRewards } from "@backend/health";
import { REWARD_TIERS } from "@/lib/portal/universe";
import { dayKey } from "@/lib/portal/metrics";
import { audit } from "@backend/audit";
import { withPatient, withPatientMutation, readJson, HttpError } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient }) => { await evaluateRewards(patient).catch(() => 0); return getRewards(patient); });

export const POST = (req: Request) => withPatientMutation(async ({ patient, ip }) => {
  const want = Number((await readJson(req)).points);
  const tier = REWARD_TIERS.find((t) => t.points === want);
  if (!tier) throw new HttpError(400, "Choose a reward.");
  if ((await balance(patient.id)) < tier.points) throw new HttpError(400, "Not enough points yet — keep your streak going!");
  const code = "NEYU-" + randomBytes(4).toString("hex").toUpperCase();
  await prisma.rewardEvent.create({ data: { patientId: patient.id, kind: "redeem", day: `${dayKey(new Date(), patient.timezone)}:${code}`, points: -tier.points, code, note: tier.label } });
  audit(patient.id, "patient", "create", `reward:${code}`, ip);
  return { code, rewards: await getRewards(patient) };
});
