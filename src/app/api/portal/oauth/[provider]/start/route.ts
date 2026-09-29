// GET /api/portal/oauth/{withings|oura|whoop}/start — one-time connection.
// Sets a short-lived state cookie and sends the patient to the maker's sign-in.
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getCurrentPatient } from "@backend/patientAuth";
import { authorizeUrl, isOAuthProvider, oauthConfigured, baseUrl } from "@backend/oauth";

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const base = baseUrl(req);
  const patient = await getCurrentPatient();
  if (!patient) return NextResponse.redirect(`${base}/my-health/sign-in?next=${encodeURIComponent("/my-health?s=devices")}`);
  if (!isOAuthProvider(provider) || !oauthConfigured(provider)) return NextResponse.redirect(`${base}/my-health?s=devices&oauth=unavailable`);
  const state = randomBytes(18).toString("base64url");
  const res = NextResponse.redirect(authorizeUrl(provider, state, req));
  res.cookies.set("anra_oauth", `${provider}.${state}.${patient.id}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/portal/oauth", maxAge: 600 });
  return res;
}
