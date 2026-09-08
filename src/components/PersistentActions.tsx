"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { persistentActions } from "@/data/graphNodes";

// Short labels for the mobile bottom tab bar (design reference used
// "Referral" / "Resources" instead of the full pill text).
const MOBILE_LABELS: Record<string, string> = {
  "/referral-centre": "Referral",
  "/contact": "Contact",
  "/locations": "Locations",
  "/resources": "Resources",
};

export default function PersistentActions() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop / tablet — unchanged floating pills, top-right */}
      <div className="hidden md:flex fixed top-4 right-4 md:top-6 md:right-6 z-30 flex-col gap-3">
        {persistentActions.map((a) => {
          const Icon = (Icons as any)[a.icon] || Icons.Circle;
          return (
            <Link key={a.href} href={a.href} className="glass card-hover flex items-center gap-3 rounded-full px-6 py-3.5 text-base font-semibold text-graphite-800">
              <Icon size={19} className="text-gold-600" />
              <span>{a.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile — fixed bottom tab bar, matches design reference */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-pearl-200 flex items-stretch justify-around px-2 pt-2"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        {persistentActions.map((a) => {
          const Icon = (Icons as any)[a.icon] || Icons.Circle;
          const active = pathname === a.href;
          return (
            <Link key={a.href} href={a.href} className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl min-w-[64px]">
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  active ? "gold-gloss" : "bg-pearl-100"
                }`}
              >
                <Icon size={17} className={active ? "text-graphite-900" : "text-gold-600"} />
              </span>
              <span className={`text-[11px] font-semibold ${active ? "text-graphite-900" : "text-graphite-600"}`}>
                {MOBILE_LABELS[a.href] || a.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}