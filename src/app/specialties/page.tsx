"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ChevronRight, ArrowRight, MapPin, Phone } from "lucide-react";
import Reveal from "@/components/Reveal";
import UtilityCards from "@/components/UtilityCards";
import HeroVisual from "@/components/HeroVisual";
import PrecisionJourney from "@/components/PrecisionJourney";
import { services, locations, whyChoose, aboutStory, languages } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";

export default function SpecialtiesPage() {
  const { t, lang } = useLanguage();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="relative h-[560px] md:h-[640px]">
          <HeroVisual />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg, rgba(30,28,24,0.85) 0%, rgba(30,28,24,0.55) 45%, rgba(30,28,24,0.2) 75%, rgba(30,28,24,0.05) 100%)" }}
          />
          <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-10 flex items-end pb-14 md:pb-16">
            <Reveal>
              <p className="text-sm font-semibold tracking-wide uppercase mb-4 text-gold-300">
                {t("home.heroTag")}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.12] mb-5 text-white max-w-2xl">
                {t("home.heroTitle")}
              </h1>
              <p className="text-base md:text-lg leading-relaxed mb-7 text-white/85 max-w-xl">
                {t("home.heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="gold-gloss px-6 py-3 rounded-full text-sm font-semibold shadow-glow transition-transform hover:scale-105">
                  {t("nav.bookAppointment")}
                </Link>
                <Link href="/services" className="glass px-6 py-3 rounded-full text-sm font-semibold text-white border-white/30 transition-colors hover:bg-white/10">
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

        <div className="bg-pearl-50 pt-8 pb-16 md:pb-20">
          <UtilityCards />
        </div>
      </section>

      <div className="h-6 md:h-10" />

      <section className="py-16 md:py-24 px-6 lg:px-10 bg-pearl-50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600">How Precision Care Works Here</p>
            <h2 className="text-2xl md:text-3xl font-bold text-graphite-900">From consultation to lifelong monitoring</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <PrecisionJourney />
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600">{t("home.whatWeOffer")}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-graphite-900">{t("home.diagnosticTeam")}</h2>
            </div>
            <Link href="/services" className="text-sm font-semibold inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 transition-colors">
              {t("home.seeAllServices")} <ArrowRight size={14} />
            </Link>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.slice(0, 6).map((s, i) => {
              const Icon = (Icons as any)[s.icon] || Icons.Activity;
              return (
                <Reveal key={s.slug} delay={(i % 3) * 0.08}>
                  <div className="glass card-hover rounded-2xl p-7 h-full">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-gold-50">
                      <Icon size={18} color="#9E801F" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-graphite-900">{tc(lang, "services", s.slug, "name", s.name)}</h3>
                    <p className="text-sm leading-relaxed text-graphite-600">{tc(lang, "services", s.slug, "short", s.short)}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 lg:px-10 bg-pearl-50">
        <div className="max-w-7xl mx-auto">
          <Reveal><h2 className="text-2xl md:text-3xl font-bold mb-12 text-center text-graphite-900">{t("home.whyChoose")}</h2></Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {whyChoose.map((w, i) => {
              const Icon = (Icons as any)[w.icon] || Icons.Award;
              return (
                <Reveal key={w.title} delay={i * 0.08} className="text-center">
                  <div className="glass w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center">
                    <Icon size={20} color="#9E801F" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2 text-graphite-900">{tc(lang, "whyChoose", w.title, "title", w.title)}</h3>
                  <p className="text-sm leading-relaxed text-graphite-600">{tc(lang, "whyChoose", w.title, "desc", w.desc)}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-14 items-center">
          <Reveal className="order-2 md:order-1">
            <div className="glass rounded-2xl overflow-hidden card-hover aspect-[4/5] flex items-center justify-center bg-graphite-900">
              <svg viewBox="0 0 300 200" className="w-3/4">
                <path
                  d="M0,100 L80,100 L100,100 L112,60 L124,140 L136,40 L148,100 L170,100 L182,92 L200,100 L300,100"
                  fill="none"
                  stroke="#C9A227"
                  strokeWidth="2.5"
                  className="ecg-draw"
                />
              </svg>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="order-1 md:order-2">
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-gold-600">{t("home.ourStory")}</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-5 text-graphite-900">{t("home.aboutHeading")}</h2>
            {tc(lang, "misc", "aboutStory", "text", aboutStory).split("\n\n").map((p, i) => (
              <p key={i} className="text-base leading-relaxed mb-4 text-graphite-600">{p}</p>
            ))}
            <Link href="/about" className="text-sm font-semibold inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 transition-colors">
              {t("home.learnMoreTeam")} <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 lg:px-10 bg-pearl-50">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600">{t("home.visitUs")}</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-graphite-900">{t("home.twoLocations")}</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {locations.map((loc, i) => (
              <Reveal key={loc.name} delay={i * 0.1}>
                <div className="glass card-hover rounded-2xl p-8 h-full">
                  <p className="text-xs font-semibold tracking-wide uppercase mb-2 text-gold-600">{tc(lang, "locations", loc.tag, "tag", loc.tag)}</p>
                  <h3 className="text-xl font-bold mb-4 text-graphite-900">{tc(lang, "locations", loc.tag, "name", loc.name)}</h3>
                  <div className="space-y-2.5 text-sm text-graphite-600">
                    <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-gold-600" /> {loc.address}</p>
                    <p className="flex items-center gap-2"><Phone size={15} className="shrink-0 text-gold-600" /> {loc.phone}</p>
                  </div>
                  <a href={`tel:${loc.phone.replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-gold-700">
                    {t("home.callLocation")} <ChevronRight size={14} />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto text-center">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-4 text-gold-600">{t("home.multilingualCare")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {languages.map((l) => (
                <span key={l} className="px-4 py-1.5 rounded-full text-sm bg-pearl-100 text-graphite-600 border border-pearl-300">{l}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14 md:py-16 px-6 lg:px-10">
        <Reveal className="glass max-w-4xl mx-auto text-center rounded-3xl py-14 px-6">
          <h2 className="text-xl md:text-3xl font-bold mb-4 text-graphite-900">{t("home.readyToBook")}</h2>
          <p className="mb-7 text-graphite-600">{t("home.readySubtitle")}</p>
          <Link href="/contact" className="gold-gloss inline-block px-7 py-3 rounded-full text-sm font-semibold shadow-glow transition-transform hover:scale-105">
            {t("nav.bookAppointment")}
          </Link>
        </Reveal>
      </section>
    </>
  );
}