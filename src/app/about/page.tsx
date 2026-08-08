"use client";

import Link from "next/link";
import { Globe2, Award } from "lucide-react";
import Reveal from "@/components/Reveal";
import { aboutStory, languages, brand } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";

export default function About() {
  const { t, lang } = useLanguage();

  return (
    <>
      <section className="pt-16 pb-20 px-6 lg:px-10 bg-bgalt">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-coral">{t("about.ourStory")}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5">
              {t("about.heading")}
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="rounded-2xl overflow-hidden card-hover" style={{ boxShadow: "0 20px 50px rgba(44,62,80,0.1)" }}>
              <div className="aspect-[4/5]">
                <img src="/dr-kapoor-physicians.webp" alt={brand.founder} className="w-full h-full object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            {tc(lang, "misc", "aboutStory", "text", aboutStory).split("\n\n").map((p, i) => (
              <p key={i} className="text-base leading-relaxed mb-4 text-inksoft">{p}</p>
            ))}
            <div className="flex items-center gap-3 mt-6 p-4 rounded-xl bg-bluesoft">
              <Award size={20} color="#3B7EA1" />
              <p className="text-sm font-medium text-ink">{t("about.founded")} {brand.founder}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 lg:px-10 bg-bgalt">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <Globe2 size={28} color="#3B7EA1" className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t("about.multilingualTeam")}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {languages.map((l) => (
                <span key={l} className="px-4 py-1.5 rounded-full text-sm bg-white text-inksoft border border-line">{l}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14 px-6 lg:px-10">
        <Reveal className="max-w-4xl mx-auto text-center rounded-3xl py-14 px-6" style={{ background: "linear-gradient(135deg, #EAF3F7, #FBEDED)" }}>
          <h2 className="text-xl md:text-3xl font-bold mb-4">{t("about.meetTeam")}</h2>
          <p className="mb-7 text-inksoft">{t("about.bookConsultation")}</p>
          <Link href="/contact" className="inline-block px-7 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105">
            {t("nav.bookAppointment")}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
