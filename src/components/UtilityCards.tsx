"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Reveal from "./Reveal";
import { PhysicianArt, LocationArt, AppointmentArt } from "./CardArt";
import { useLanguage } from "@/i18n/LanguageContext";

export default function UtilityCards() {
  const { t } = useLanguage();

  const cards = [
    {
      Art: PhysicianArt,
      header: "bg-bluesoft",
      title: t("utility.physiciansTitle"),
      desc: t("utility.physiciansDesc"),
      cta: t("utility.physiciansCta"),
      to: "/physicians",
    },
    {
      Art: LocationArt,
      header: "bg-mint",
      title: t("utility.locationsTitle"),
      desc: t("utility.locationsDesc"),
      cta: t("utility.locationsCta"),
      to: "/contact",
    },
    {
      Art: AppointmentArt,
      header: "bg-coralsoft",
      title: t("utility.appointmentsTitle"),
      desc: t("utility.appointmentsDesc"),
      cta: t("utility.appointmentsCta"),
      to: "/contact",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto relative -bottom-8 md:-bottom-12 grid sm:grid-cols-3 gap-5 md:gap-6 px-6 lg:px-10">
      {cards.map((c, i) => (
        <Reveal key={c.title} delay={i * 0.08}>
          <Link
            href={c.to}
            className="card-hover block bg-white rounded-2xl overflow-hidden h-full"
            style={{ boxShadow: "0 10px 30px rgba(44,62,80,0.1)" }}
          >
            <div className={`${c.header} h-32`}>
              <c.Art />
            </div>
            <div className="p-6">
              <h3 className="text-base font-semibold mb-1 text-ink">{c.title}</h3>
              <p className="text-sm mb-4 text-inksoft">{c.desc}</p>
              <span className="text-sm font-semibold inline-flex items-center gap-1 text-blue">
                {c.cta} <ChevronRight size={14} />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
