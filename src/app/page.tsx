"use client";

import React from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import IntroExperience from "@/components/IntroExperience";
import HealthGraph from "@/components/HealthGraph";
import ConciergeBar from "@/components/ConciergeBar";
import MorphingHeadline from "@/components/MorphingHeadline";
import { locations, brand } from "@/data/content";

export default function Home() {
  return (
    <>
      <IntroExperience />
      <section className="pt-4 pb-16 md:pt-20 md:pb-20 px-6 md:min-h-screen">
        <div className="text-center mb-5 md:mb-10">
          <img src="/logo.png" alt="ANRA Health" className="h-8 md:h-10 w-auto mx-auto mb-3" />
          <MorphingHeadline
            text="Healthcare Designed Around You"
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-[1.15]"
          />
        </div>

        <ConciergeBar />

        <HealthGraph />

        {/* Mobile-only extras: clinical network, locations, quick links */}
        <div className="md:hidden px-5 mt-2 mb-28 space-y-5">
          <div className="clay p-5" style={{ background: "linear-gradient(135deg, #3F6F7C 0%, #1F3A41 100%)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-200 mb-1.5">Calgary Clinical Network</p>
            <p className="text-white/75 text-xs leading-relaxed mb-4">
              Integrated multispecialty diagnostics and vital monitoring across {brand.name}.
            </p>
            <div className="flex items-center gap-2">
              {locations[0]?.phone && (
                <a href={`tel:${locations[0].phone}`} className="flex-1 text-center text-xs font-semibold text-white/90 border border-white/25 rounded-full py-2.5">
                  {locations[0].phone}
                </a>
              )}
              <Link href="/contact" className="flex-1 text-center gold-gloss text-xs font-semibold rounded-full py-2.5">
                Email Clinic
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3 px-1">Clinical Locations</p>
            <div className="space-y-3">
              {locations.map((l) => (
                <div key={l.tag} className="clay p-4 flex items-start gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center shrink-0">
                    <Icons.MapPin size={17} className="text-gold-600" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-graphite-900 text-sm">{l.name}</p>
                    <p className="text-xs text-graphite-500 mt-0.5 leading-snug">{l.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 mb-3 px-1">Patient Essentials</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/referral-centre" className="clay p-4 flex flex-col items-center text-center gap-2">
                <Icons.FileText size={20} className="text-gold-600" />
                <span className="text-xs font-semibold text-graphite-900">Referral Centre</span>
                <span className="text-[10px] text-graphite-500">Fast track intake</span>
              </Link>
              <Link href="/resources" className="clay p-4 flex flex-col items-center text-center gap-2">
                <Icons.BookOpenCheck size={20} className="text-gold-600" />
                <span className="text-xs font-semibold text-graphite-900">Patient Resources</span>
                <span className="text-[10px] text-graphite-500">Prep & records</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}