"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Icons from "lucide-react";
import { ArrowRight, X, ChevronRight, ChevronLeft, Heart, FlaskConical, CheckCircle2, Activity, HandHeart } from "lucide-react";
import Reveal from "@/components/Reveal";
import { services, charmClinic, clinicalTrials } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";

function ModalShell({ onClose, children, t }: { onClose: () => void; children: React.ReactNode; t: (k: string) => string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(11,23,38,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl flex flex-col"
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-semibold text-blue"
          >
            <ChevronLeft size={16} /> {t("services.backToServices")}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-bgalt" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ServiceModal({ service, onClose, t, lang }: { service: any; onClose: () => void; t: (k: string) => string; lang: string }) {
  if (!service) return null;
  const Icon = (Icons as any)[service.icon] || Icons.Activity;
  return (
    <ModalShell onClose={onClose} t={t}>
      <div className="p-6 md:p-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-bluesoft">
          <Icon size={26} color="#3B7EA1" />
        </div>
        <h2 className="text-2xl font-bold mb-4">{tc(lang, "services", service.slug, "name", service.name)}</h2>
        <p className="text-sm leading-relaxed text-inksoft mb-8">{tc(lang, "services", service.slug, "long", service.long)}</p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105"
        >
          {t("nav.bookAppointment")} <ChevronRight size={15} />
        </Link>
      </div>
    </ModalShell>
  );
}

function SectionBlock({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-2xl p-5 bg-bgalt border-l-4" style={{ borderColor: "#3B7EA1" }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} color="#3B7EA1" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-ink">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-inksoft">{text}</p>
    </div>
  );
}

function CharmModal({ open, onClose, t, lang }: { open: boolean; onClose: () => void; t: (k: string) => string; lang: string }) {
  if (!open) return null;
  return (
    <ModalShell onClose={onClose} t={t}>
      <div style={{ height: 200, overflow: "hidden" }} className="relative">
        <img
          src="/charm-clinic-heart.png"
          alt="CHARM Clinic"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        {/* Stronger, full-height overlay — the source image has "CHARM CLINIC" baked into its
            artwork, which visually collided with our translated heading text in non-English
            languages. This darkens the whole image so only our translated heading is legible. */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(11,23,38,0.88) 0%, rgba(11,23,38,0.6) 55%, rgba(11,23,38,0.35) 100%)" }} />
        <div className="absolute bottom-4 left-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80 mb-1">{t("services.communityResearch")}</p>
          <h2 className="text-2xl font-bold text-white">{t("services.charmTitle")}</h2>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue mb-5">{charmClinic.fullName}</p>
        <div className="grid gap-4">
          <SectionBlock icon={Heart} title={t("services.overview")} text={tc(lang, "charmClinic", "info", "intro", charmClinic.intro)} />
          <SectionBlock icon={Activity} title={t("services.howItWorks")} text={tc(lang, "charmClinic", "info", "howItWorks", charmClinic.howItWorks)} />
          <SectionBlock icon={HandHeart} title={t("services.selfCareSupport")} text={tc(lang, "charmClinic", "info", "selfCare", charmClinic.selfCare)} />
          <SectionBlock icon={FlaskConical} title={t("services.researchAtCharm")} text={tc(lang, "charmClinic", "info", "research", charmClinic.research)} />
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105 mt-6"
        >
          {t("services.referPatient")} <ChevronRight size={15} />
        </Link>
      </div>
    </ModalShell>
  );
}

function TrialsModal({ open, onClose, t }: { open: boolean; onClose: () => void; t: (k: string) => string }) {
  if (!open) return null;
  return (
    <ModalShell onClose={onClose} t={t}>
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-bluesoft shrink-0">
            <FlaskConical size={22} color="#3B7EA1" />
          </div>
          <h2 className="text-2xl font-bold">{t("services.trialsTitle")}</h2>
        </div>
        <p className="text-sm leading-relaxed text-inksoft mb-6">
          {t("services.trialsIntro")}
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5 mb-8">
          {clinicalTrials.map((tr) => (
            <div
              key={tr}
              className="flex items-center gap-2.5 text-sm rounded-xl px-4 py-3 bg-bgalt"
            >
              <CheckCircle2 size={15} className="shrink-0 text-blue" />
              <span className="font-medium">{tr}</span>
            </div>
          ))}
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105"
        >
          {t("services.askAboutParticipation")} <ChevronRight size={15} />
        </Link>
      </div>
    </ModalShell>
  );
}

function ServicesInner() {
  const [selected, setSelected] = useState<any>(null);
  const [charmOpen, setCharmOpen] = useState(false);
  const [trialsOpen, setTrialsOpen] = useState(false);
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();

  useEffect(() => {
    const open = searchParams.get("open");
    if (open === "charm") setCharmOpen(true);
    if (open === "trials") setTrialsOpen(true);
  }, [searchParams]);

  return (
    <>
      <section className="relative pt-16 pb-24 px-6 lg:px-10 bg-bgalt overflow-hidden">
        <div className="blob1 absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-40 blur-3xl pointer-events-none bg-bluesoft" />
        <div className="blob2 absolute top-4 right-0 w-80 h-80 rounded-full opacity-50 blur-3xl pointer-events-none bg-coralsoft" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide uppercase mb-3 text-coral">{t("services.ourServices")}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5">
              {t("services.heading")}
            </h1>
            <p className="text-base md:text-lg text-inksoft">
              {t("services.subtitle")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {services.map((s, i) => {
            const Icon = (Icons as any)[s.icon] || Icons.Activity;
            return (
              <Reveal key={s.slug} delay={(i % 3) * 0.07}>
                <button
                  onClick={() => setSelected(s)}
                  className="card-hover text-left bg-white rounded-2xl p-8 md:p-9 h-full w-full flex flex-col min-h-[260px]"
                  style={{ boxShadow: "0 6px 20px rgba(44,62,80,0.06)" }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-bluesoft">
                    <Icon size={24} color="#3B7EA1" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{tc(lang, "services", s.slug, "name", s.name)}</h3>
                  <p className="text-sm leading-relaxed text-inksoft mb-6 flex-1">{tc(lang, "services", s.slug, "short", s.short)}</p>
                  <span className="text-sm font-semibold inline-flex items-center gap-1 text-blue">
                    {t("services.learnMore")} <ChevronRight size={14} />
                  </span>
                </button>
              </Reveal>
            );
          })}

          <Reveal delay={0.1}>
            <button
              onClick={() => setCharmOpen(true)}
              className="card-hover text-left rounded-2xl p-8 md:p-9 h-full w-full flex flex-col min-h-[260px]"
              style={{ background: "linear-gradient(135deg, #EAF3F7, #FBEDED)", boxShadow: "0 6px 20px rgba(44,62,80,0.06)" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white">
                <Heart size={24} color="#D65A5A" />
              </div>
              <h3 className="text-lg font-bold mb-3">{t("services.charmTitle")}</h3>
              <p className="text-sm leading-relaxed text-inksoft mb-6 flex-1">
                {t("services.charmDesc")}
              </p>
              <span className="text-sm font-semibold inline-flex items-center gap-1 text-blue">
                {t("services.learnMore")} <ChevronRight size={14} />
              </span>
            </button>
          </Reveal>

          <Reveal delay={0.15}>
            <button
              onClick={() => setTrialsOpen(true)}
              className="card-hover text-left rounded-2xl p-8 md:p-9 h-full w-full flex flex-col min-h-[260px]"
              style={{ background: "linear-gradient(135deg, #EAF3F7, #FBEDED)", boxShadow: "0 6px 20px rgba(44,62,80,0.06)" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white">
                <FlaskConical size={24} color="#D65A5A" />
              </div>
              <h3 className="text-lg font-bold mb-3">{t("services.trialsTitle")}</h3>
              <p className="text-sm leading-relaxed text-inksoft mb-6 flex-1">
                {t("services.trialsDesc")}
              </p>
              <span className="text-sm font-semibold inline-flex items-center gap-1 text-blue">
                {t("services.viewTrials")} <ChevronRight size={14} />
              </span>
            </button>
          </Reveal>
        </div>
      </section>

      <section className="py-14 px-6 lg:px-10">
        <Reveal className="max-w-4xl mx-auto text-center rounded-3xl py-14 px-6" style={{ background: "linear-gradient(135deg, #EAF3F7, #FBEDED)" }}>
          <h2 className="text-xl md:text-3xl font-bold mb-4">{t("services.notSure")}</h2>
          <p className="mb-7 text-inksoft">{t("services.notSureDesc")}</p>
          <Link href="/contact" className="inline-block px-7 py-3 rounded-full text-sm font-semibold text-white bg-blue transition-transform hover:scale-105">
            {t("services.contactUs")} <ArrowRight size={14} className="inline ml-1" />
          </Link>
        </Reveal>
      </section>

      <ServiceModal service={selected} onClose={() => setSelected(null)} t={t} lang={lang} />
      <CharmModal open={charmOpen} onClose={() => setCharmOpen(false)} t={t} lang={lang} />
      <TrialsModal open={trialsOpen} onClose={() => setTrialsOpen(false)} t={t} />
    </>
  );
}

// useSearchParams() requires a Suspense boundary in Next.js App Router — this
// wrapper is new (Vite/React Router had no such requirement), everything else
// about the component is unchanged.
export default function Services() {
  return (
    <Suspense fallback={null}>
      <ServicesInner />
    </Suspense>
  );
}
