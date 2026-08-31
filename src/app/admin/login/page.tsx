"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Incorrect password.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center px-6"
      style={{ background: "linear-gradient(160deg, #313425 0%, #23261a 45%, #14160f 100%)", minHeight: "100vh" }}
    >
      <div className="glass rounded-3xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={18} className="text-gold-600" />
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">ANRA Health — Internal</p>
        </div>
        <h1 className="text-2xl font-display font-bold text-graphite-900 mb-6">Admin Dashboard</h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-3 rounded-xl border border-pearl-300 bg-[#e8e4d5] text-black text-sm outline-none focus:ring-2 focus:ring-gold-500 mb-4"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          onClick={submit}
          disabled={!password || loading}
          className="w-full gold-gloss px-6 py-3 rounded-full text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Checking…" : "Log In"}
        </button>
      </div>
    </div>
  );
}