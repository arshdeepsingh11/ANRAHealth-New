// GET /api/portal/oauth/{provider}/callback — the maker sends the patient back
// here with a code; we swap it for tokens (encrypted), pull 30 days, and
// return to Devices.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@backend/db";
import { getCurrentPatient, clientMeta } from "@backend/patientAuth";
import { exchangeCode, saveTokens, syncConnection, isOAuthProvider, baseUrl } from "@backend/oauth";
import { DEVICE_CATALOG } from "@/lib/portal/devices";
import { audit } from "@backend/audit";

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const base = baseUrl(req), url = new URL(req.url);
  const back = (q: string) => { const r = NextResponse.redirect(`${base}/my-health?s=devices&${q}`); r.cookies.set("anra_oauth", "", { path: "/api/portal/oauth", maxAge: 0 }); return r; };
  const jar = await cookies();
  const [cp, cstate, cpid] = (jar.get("anra_oauth")?.value || "").split(".");
  const patient = await getCurrentPatient();
  if (!patient || !isOAuthProvider(provider)) return back("oauth=failed");
  if (url.searchParams.get("error")) return back(`oauth=cancelled&p=${provider}`);
  const code = url.searchParams.get("code"), state = url.searchParams.get("state");
  if (!code || !state || cp !== provider || cstate !== state || cpid !== patient.id) return back(`oauth=failed&p=${provider}`);
  try {
    const t = await exchangeCode(provider, code, req);
    const dev = DEVICE_CATALOG.find((d) => d.id === provider)!;
    await saveTokens(patient.id, provider, t, dev.signals.map((s) => s.label));
    const conn = await prisma.deviceConnection.findUnique({ where: { patientId_provider: { patientId: patient.id, provider } }, select: { id: true } });
    if (conn) await syncConnection(conn.id, 30);
    audit(patient.id, "patient", "create", `device:${provider}:oauth`, (await clientMeta()).ip);
    return back(`connected=${provider}`);
  } catch (e: any) {
    console.error("OAuth callback failed:", e?.message);
    return back(`oauth=failed&p=${provider}`);
  }
}
