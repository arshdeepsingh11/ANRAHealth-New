"use client";

import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { brand, locations } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="pt-16 pb-10 px-6 lg:px-10 bg-pearl-50 border-t border-pearl-200">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm text-graphite-600">
        <div>
          <img src="/logo.png" alt="ANRA Health" className="h-12 w-auto mb-4" />
          <p>{t("footer.tagline")}</p>
        </div>
        <div>
          <p className="font-semibold mb-3 text-graphite-900">{t("footer.contact")}</p>
          <p className="flex items-center gap-2 mb-2">
            <Phone size={13} className="text-gold-600" /> {brand.phone}
          </p>
          <p className="flex items-center gap-2">
            <Mail size={13} className="text-gold-600" /> {brand.email}
          </p>
        </div>
        <div>
          <p className="font-semibold mb-3 text-graphite-900">{t("footer.locations")}</p>
          {locations.map((l) => (
            <p key={l.tag} className="mb-2">
              {tc(lang, "locations", l.tag, "tag", l.tag)} — {l.address.split(",")[0]}
            </p>
          ))}
        </div>
        <div>
          <p className="font-semibold mb-3 text-graphite-900">{t("footer.quickLinks")}</p>
          <div className="flex flex-col gap-2">
            <Link href="/about" className="hover:text-gold-700 transition-colors">{t("footer.aboutUs")}</Link>
            <Link href="/referral-centre" className="hover:text-gold-700 transition-colors">Referral Centre</Link>
            <Link href="/resources" className="hover:text-gold-700 transition-colors">Patient Resources</Link>
            <Link href="/contact" className="hover:text-gold-700 transition-colors">{t("nav.contact")}</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 text-xs border-t border-pearl-200 text-graphite-500">
        © {new Date().getFullYear()} {brand.name}. {t("footer.rights")}
      </div>
    </footer>
  );
}