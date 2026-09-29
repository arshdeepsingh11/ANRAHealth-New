// /admin — ANRA Health Admin Console. The page checks the staff session on the
// server; the console itself is a client app (src/components/admin).

import type { Metadata } from "next";
import { getAdmin } from "@backend/adminAuth";
import AdminConsole from "@/components/admin/AdminConsole";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Console — ANRA Health", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const admin = await getAdmin();
  return <AdminConsole signedIn={!!admin} actor={admin?.actor || ""} />;
}
