"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ChevronRight, ArrowRight, MapPin, Phone } from "lucide-react";
import Reveal from "@/components/Reveal";
import UtilityCards from "@/components/UtilityCards";
import { services, locations, whyChoose, aboutStory, languages } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";
// drone-shot.mp4 is served from /public/videos — referenced by path below, no import needed

function AnimatedCounter({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 1200;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-ink">{count}{suffix}</div>
      <div className="text-xs md:text-sm mt-1 text-inksoft">{label}</div>
    </div>
  );
}

export default function Home() {
  const { t, lang } = useLanguage();

  return (
    <>
      {/* Hero — full-bleed drone video background, Cleveland-Clinic style */}
      <section className="relative overflow-hidden">
        <div className="relative h-[520px] md:h-[600px]">
          <video
            src="/videos/drone-shot.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
           style={{ background: "linear-gradient(0deg, rgba(11,23,38,0.92) 0%, rgba(11,23,38,0.8) 35%, rgba(11,23,38,0.35) 70%, rgba(11,23,38,0.05) 100%)" }}
          />
          <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-10 flex items-end pb-14 md:pb-16">
            <Reveal>
              <p className="text-sm font-semibold tracking-wide uppercase mb-4 text-white/80">
                {t("home.heroTag")}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.12] mb-5 text-white max-w-2xl">
                {t("home.heroTitle")}
              </h1>
              <p className="text-base md:text-lg leading-relaxed mb-7 text-white/85 max-w-xl">
                {t("home.heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105">
                  {t("nav.bookAppointment")}
                </Link>
                <Link href="/services" className="px-6 py-3 rounded-full text-sm font-semibold border border-white/40 text-white transition-colors hover:bg-white/10">
                  {t("home.viewServices")}
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-8 max-w-md">
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white">2</div>
                  <div className="text-xs md:text-sm mt-1 text-white/75">{t("home.calgaryLocations")}</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white">10+</div>
                  <div className="text-xs md:text-sm mt-1 text-white/75">{t("home.languagesSpoken")}</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white">1</div>
                  <div className="text-xs md:text-sm mt-1 text-white/75">{t("home.regionalFirst")}</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="bg-bgalt pt-8 pb-16 md:pb-20">
          <UtilityCards />
        </div>
      </section>

      <div className="h-6 md:h-10" />

      {/* Services preview */}
      <section className="py-16 md:py-24 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-coral">{t("home.whatWeOffer")}</p>
              <h2 className="text-2xl md:text-3xl font-bold">{t("home.diagnosticTeam")}</h2>
            </div>
            <Link href="/services" className="text-sm font-semibold inline-flex items-center gap-1 text-blue">
              {t("home.seeAllServices")} <ArrowRight size={14} />
            </Link>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.slice(0, 6).map((s, i) => {
              const Icon = (Icons as any)[s.icon] || Icons.Activity;
              return (
                <Reveal key={s.slug} delay={(i % 3) * 0.08}>
                  <div className="card-hover bg-white rounded-2xl p-7 h-full" style={{ boxShadow: "0 6px 20px rgba(44,62,80,0.06)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-bluesoft">
                      <Icon size={18} color="#3B7EA1" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">{tc(lang, "services", s.slug, "name", s.name)}</h3>
                    <p className="text-sm leading-relaxed text-inksoft">{tc(lang, "services", s.slug, "short", s.short)}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 md:py-24 px-6 lg:px-10 bg-bgalt">
        <div className="max-w-7xl mx-auto">
          <Reveal><h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">{t("home.whyChoose")}</h2></Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {whyChoose.map((w, i) => {
              const Icon = (Icons as any)[w.icon] || Icons.Award;
              return (
                <Reveal key={w.title} delay={i * 0.08} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-white" style={{ boxShadow: "0 6px 16px rgba(44,62,80,0.08)" }}>
                    <Icon size={20} color="#3B7EA1" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{tc(lang, "whyChoose", w.title, "title", w.title)}</h3>
                  <p className="text-sm leading-relaxed text-inksoft">{tc(lang, "whyChoose", w.title, "desc", w.desc)}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-16 md:py-24 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-14 items-center">
          <Reveal className="order-2 md:order-1">
            <div className="rounded-2xl overflow-hidden card-hover" style={{ boxShadow: "0 20px 50px rgba(44,62,80,0.1)" }}>
              <div className="aspect-[4/5]">
                <img src="/dr-kapoor-home.jpeg" alt="Dr. Anmol S. Kapoor" className="w-full h-full object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="order-1 md:order-2">
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-coral">{t("home.ourStory")}</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-5">{t("home.aboutHeading")}</h2>
            {tc(lang, "misc", "aboutStory", "text", aboutStory).split("\n\n").map((p, i) => (
              <p key={i} className="text-base leading-relaxed mb-4 text-inksoft">{p}</p>
            ))}
            <Link href="/about" className="text-sm font-semibold inline-flex items-center gap-1 text-blue">
              {t("home.learnMoreTeam")} <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 md:py-24 px-6 lg:px-10 bg-bgalt">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-coral">{t("home.visitUs")}</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-10">{t("home.twoLocations")}</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {locations.map((loc, i) => (
              <Reveal key={loc.name} delay={i * 0.1}>
                <div className="card-hover bg-white rounded-2xl p-8 h-full" style={{ boxShadow: "0 8px 24px rgba(44,62,80,0.08)" }}>
                  <p className="text-xs font-semibold tracking-wide uppercase mb-2 text-blue">{tc(lang, "locations", loc.tag, "tag", loc.tag)}</p>
                  <h3 className="text-xl font-bold mb-4">{tc(lang, "locations", loc.tag, "name", loc.name)}</h3>
                  <div className="space-y-2.5 text-sm text-inksoft">
                    <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> {loc.address}</p>
                    <p className="flex items-center gap-2"><Phone size={15} className="shrink-0" /> {loc.phone}</p>
                  </div>
                  <a href={`tel:${loc.phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-coral">
                    {t("home.callLocation")} <ChevronRight size={14} />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-14 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto text-center">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-4 text-coral">{t("home.multilingualCare")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {languages.map((l) => (
                <span key={l} className="px-4 py-1.5 rounded-full text-sm bg-bgalt text-inksoft border border-line">{l}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-16 px-6 lg:px-10">
        <Reveal className="max-w-4xl mx-auto text-center rounded-3xl py-14 px-6" style={{ background: "linear-gradient(135deg, #EAF3F7, #FBEDED)" }}>
          <h2 className="text-xl md:text-3xl font-bold mb-4">{t("home.readyToBook")}</h2>
          <p className="mb-7 text-inksoft">{t("home.readySubtitle")}</p>
          <Link href="/contact" className="inline-block px-7 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105">
            {t("nav.bookAppointment")}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
