"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-pearl-300 text-graphite-600"
    >
      <LogOut size={14} /> Log Out
    </button>
  );
}