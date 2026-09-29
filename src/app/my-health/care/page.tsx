// /my-health/care?token=… — accept a family-care invite from an email link.
// The signed-in account's email must match the invited email.
import { redirect } from "next/navigation";
import { getCurrentPatient } from "@backend/patientAuth";
import { acceptCare } from "@backend/social";

export const dynamic = "force-dynamic";

export default async function CareAcceptPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token.slice(0, 80) : "";
  const p = await getCurrentPatient();
  if (!p) redirect(`/my-health/sign-in?next=${encodeURIComponent(`/my-health/care?token=${token}`)}`);
  if (!p.emailVerified) redirect("/my-health/verify");
  let error = "";
  try { await acceptCare(p, { token }); } catch (e: any) { error = e?.message || "This invite is no longer valid."; }
  if (!error) redirect("/my-health?s=family&care=accepted");
  return (
    <main className="mhs mhs-page" style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ padding: "32px 28px", borderRadius: 24, background: "#FFFDFB", border: "1px solid rgba(29,35,39,.06)" }}>
        <h1 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 500 }}>We couldn't accept this invite</h1>
        <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.55, color: "#5B6369" }}>{error}</p>
        <a href="/my-health?s=family" style={{ color: "#3F6F7C", fontWeight: 500 }}>Go to Family &amp; sharing</a>
      </div>
    </main>
  );
}
