"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronDown, Globe } from "lucide-react";
import { brand } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGES } from "@/i18n/languages";

function ServicesDropdown({ t }: { t: (key: string) => string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const servicesDropdown = [
    { label: t("nav.allServices"), to: "/services" },
    { label: t("nav.charmClinic"), to: "/services?open=charm" },
    { label: t("nav.clinicalTrials"), to: "/services?open=trials" },
  ];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-inksoft hover:text-ink transition-colors"
      >
        {t("nav.services")} <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl overflow-hidden z-50"
          style={{ boxShadow: "0 12px 30px rgba(44,62,80,0.15)" }}
        >
          {servicesDropdown.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-ink hover:bg-bgalt transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguageSwitcher({ lang, setLang, t }: { lang: string; setLang: (l: string) => void; t: (key: string) => string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("lang.select")}
        className="flex items-center gap-1.5 text-inksoft hover:text-ink transition-colors text-sm font-medium"
      >
        <Globe size={15} />
        <span>{current.native}</span>
        <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto"
          style={{ boxShadow: "0 12px 30px rgba(44,62,80,0.15)" }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className="w-full text-left flex items-center justify-between px-4 py-2.5 text-sm hover:bg-bgalt transition-colors"
              style={{ color: l.code === lang ? "#3B7EA1" : "#2C3E50", fontWeight: l.code === lang ? 600 : 400 }}
            >
              <span>{l.native}</span>
              {l.code !== "en" && <span className="text-xs text-inksoft">{l.label}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Next.js equivalent of react-router's useLocation().pathname
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  const navItems = [
    { label: t("nav.physicians"), to: "/physicians" },
    { label: t("nav.cardiacSymptoms"), to: "/cardiac-symptoms" },
    { label: t("nav.about"), to: "/about" },
    { label: t("nav.careers"), to: "/careers" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  const servicesDropdownMobile = [
    { label: t("nav.allServices"), to: "/services" },
    { label: t("nav.charmClinic"), to: "/services?open=charm" },
    { label: t("nav.clinicalTrials"), to: "/services?open=trials" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <div className="hidden md:block text-xs bg-ink text-[#C9D6E0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-2 flex justify-between items-center">
          <span>{t("topbar.locations")}</span>
          <div className="flex gap-6 items-center">
            <a href={`tel:${brand.phone.replace(/[^0-9]/g, "")}`} className="hover:text-white transition-colors">{brand.phone}</a>
            <Link href="/careers" className="hover:text-white transition-colors">{t("topbar.careers")}</Link>
            <Link href="/contact" className="hover:text-white transition-colors">{t("topbar.refer")}</Link>
          </div>
        </div>
      </div>

      <header
        className="sticky top-0 z-40 transition-all duration-300 border-b border-line"
        style={{
          background: scrolled ? "rgba(255,255,255,0.88)" : "white",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 4px 20px rgba(44,62,80,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="ANRA Health" className="h-14 md:h-16 w-auto" />
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <ServicesDropdown t={t} />
            {navItems.map((item) => (
              <Link key={item.to} href={item.to} className="text-inksoft hover:text-ink transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-5">
            <LanguageSwitcher lang={lang} setLang={setLang} t={t} />
            <Link
              href="/contact"
              className="inline-block text-sm font-semibold px-5 py-2.5 rounded-full text-white bg-blue transition-transform hover:scale-105 whitespace-nowrap"
            >
              {t("nav.bookAppointment")}
            </Link>
          </div>
          <button className="lg:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden px-6 pb-4 flex flex-col gap-1 border-t border-line">
            <div className="py-2">
              <LanguageSwitcher lang={lang} setLang={setLang} t={t} />
            </div>
            <button
              onClick={() => setMobileServicesOpen((o) => !o)}
              className="flex items-center justify-between text-sm font-medium py-2 text-ink"
            >
              {t("nav.services")} <ChevronDown size={14} style={{ transform: mobileServicesOpen ? "rotate(180deg)" : "none" }} />
            </button>
            {mobileServicesOpen && (
              <div className="pl-4 flex flex-col gap-1 mb-1">
                {servicesDropdownMobile.map((item) => (
                  <Link key={item.to} href={item.to} className="text-sm py-1.5 text-inksoft">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
            {navItems.map((item) => (
              <Link key={item.to} href={item.to} className="text-sm font-medium py-2 text-ink">
                {item.label}
              </Link>
            ))}
            <a href={`tel:${brand.phone.replace(/[^0-9]/g, "")}`} className="flex items-center gap-2 text-sm font-medium py-2 text-blue">
              <Phone size={15} /> {brand.phone}
            </a>
            <Link
              href="/contact"
              className="inline-block text-center text-sm font-semibold px-5 py-2.5 mt-2 rounded-full text-white bg-blue"
            >
              {t("nav.bookAppointment")}
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
