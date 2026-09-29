import { redirect } from "next/navigation";

// Sign-in now lives inside the console at /admin.
export default function AdminLoginPage() {
  redirect("/admin");
}
