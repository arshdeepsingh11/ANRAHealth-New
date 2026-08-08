"use client";

import { Briefcase, ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { careers, brand } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";

export default function Careers() {
  const { t, lang } = useLanguage();

  return (
    <>
      <section className="pt-16 pb-20 px-6 lg:px-10 bg-bgalt">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-coral">{t("careers.joinTeam")}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5">{t("careers.heading")}</h1>
            <p className="text-base md:text-lg text-inksoft">
              {t("careers.subtitle")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto grid gap-4">
          {careers.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <a
                href={`mailto:${brand.email}?subject=Application: ${c.title}`}
                className="card-hover flex items-center justify-between bg-white rounded-2xl p-6"
                style={{ boxShadow: "0 6px 20px rgba(44,62,80,0.06)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-bluesoft shrink-0">
                    <Briefcase size={18} color="#3B7EA1" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{tc(lang, "careers", c.title, "title", c.title)}</h3>
                    <p className="text-sm text-inksoft">{c.type}</p>
                  </div>
                </div>
                <ChevronRight size={18} color="#D65A5A" />
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
