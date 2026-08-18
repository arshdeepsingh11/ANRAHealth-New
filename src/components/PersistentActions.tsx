"use client";

import React from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { persistentActions } from "@/data/graphNodes";

export default function PersistentActions() {
  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col gap-3">
      {persistentActions.map((a) => {
        const Icon = (Icons as any)[a.icon] || Icons.Circle;
        return (
          <Link
            key={a.href}
            href={a.href}
            className="glass card-hover flex items-center gap-3 rounded-full px-6 py-3.5 text-base font-semibold text-graphite-800"
          >
            <Icon size={19} className="text-gold-600" />
            <span>{a.label}</span>
          </Link>
        );
      })}
    </div>
  );
}