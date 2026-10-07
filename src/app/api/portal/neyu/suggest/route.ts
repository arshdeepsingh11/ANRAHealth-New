// GET /api/portal/neyu/suggest — "Ask Neyu about me": questions that fit THIS patient's data.
import { getSpace, loadAll } from "@backend/space";
import { withPatient } from "@backend/apiHelpers";

export const GET = () => withPatient(async ({ patient }) => {
  const [s, a] = await Promise.all([getSpace(patient), loadAll(patient, 365)]);
  const q: string[] = [];
  const has = (k: string) => a.readings.some((r) => r.metric === k);
  const span = a.readings.length ? (Date.now() - new Date(a.readings[0].day).getTime()) / 864e5 : 0;
  if (s.changes.some((c) => ["new", "improved", "worsened", "changed"].includes(c.status))) q.push("What has changed recently?");
  if (s.changes.some((c) => c.status === "improved")) q.push("What am I doing better?");
  if (a.labs.length || a.docs.some((d) => d.kind === "lab")) q.push("Explain my latest blood test.");
  if (a.labs.length) q.push("What happened before my latest result?");
  if (a.bps.length >= 5) q.push("Show me my blood pressure trend.");
  if (has("sleep")) q.push("How has my sleep changed?");
  if (span >= 120) q.push("How has my health changed this year?");
  if (a.readings.length > 30 || a.meals.length > 10) q.push("What patterns have you noticed?");
  if (a.goals.length) q.push("How consistent am I with my goals?");
  if (a.appts.some((x) => x.startsAt.getTime() > Date.now()) || a.docs.length || a.labs.length) q.push("What should I discuss with my doctor?");
  if (s.gaps.length) q.push("What don't we know about my health?");
  if (!q.length) q.push("What can you do with my health information?", "How do I add my first report?");
  return { suggestions: q.slice(0, 6) };
});
