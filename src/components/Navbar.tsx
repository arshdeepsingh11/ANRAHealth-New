"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronDown, Globe } from "lucide-react";
import { brand } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGES } from "@/i18n/languages";

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
      <button onClick={() => setOpen((o) => !o)} aria-label={t("lang.select")} className="flex items-center gap-1.5 text-graphite-600 hover:text-graphite-900 transition-colors text-sm font-medium">
        <Globe size={15} className="text-gold-600" />
        <span>{current.native}</span>
        <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 glass shadow-glass rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          {LANGUAGES.map((l) => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} className="w-full text-left flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gold-50/60 transition-colors" style={{ color: l.code === lang ? "#9E801F" : "#3A362F", fontWeight: l.code === lang ? 600 : 400 }}>
              <span>{l.native}</span>
              {l.code !== "en" && <span className="text-xs text-graphite-500">{l.label}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  // Pages that use the new ANRA design system render their own chrome
  // (back arrow + tabs), so the legacy navbar must not appear on them.
  // /admin is also excluded — it's an internal, password-gated tool and
  // should never show the public site's navbar or branding chrome.
  const hideNavbar =
    pathname === "/" ||
    pathname.startsWith("/specialties") ||
    pathname.startsWith("/referral-centre") ||
    pathname === "/contact" ||
    pathname === "/locations" ||
    pathname === "/resources" ||
    pathname === "/longevity" ||
    pathname === "/lab-results" ||
    pathname.startsWith("/admin");

  const navItems = [
    { label: "About", to: "/about" },
    { label: "Research & Innovation", to: "/research" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (hideNavbar) return null;

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "glass-nav shadow-glass" : "bg-pearl-50 border-b border-pearl-200"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="ANRA Health" className="h-14 md:h-16 w-auto" />
        </Link>
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.to} href={item.to} className="text-graphite-600 hover:text-graphite-900 transition-colors">{item.label}</Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-5">
          <LanguageSwitcher lang={lang} setLang={setLang} t={t} />
          <Link href="/contact" className="gold-gloss inline-block text-sm font-semibold px-5 py-2.5 rounded-full shadow-glow transition-transform hover:scale-105 whitespace-nowrap">{t("nav.bookAppointment")}</Link>
        </div>
        <button className="lg:hidden text-graphite-800" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && (
        <div className="lg:hidden px-6 pb-4 flex flex-col gap-1 border-t border-pearl-200 bg-pearl-50">
          <div className="py-2"><LanguageSwitcher lang={lang} setLang={setLang} t={t} /></div>
          {navItems.map((item) => (
            <Link key={item.to} href={item.to} className="text-sm font-medium py-2 text-graphite-900">{item.label}</Link>
          ))}
          <a href={`tel:${brand.phone.replace(/[^0-9]/g, "")}`} className="flex items-center gap-2 text-sm font-medium py-2 text-gold-700"><Phone size={15} /> {brand.phone}</a>
          <Link href="/contact" className="gold-gloss inline-block text-center text-sm font-semibold px-5 py-2.5 mt-2 rounded-full shadow-glow">{t("nav.bookAppointment")}</Link>
        </div>
      )}
    </header>
  );
}