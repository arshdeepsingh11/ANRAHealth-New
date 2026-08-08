"use client";

import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { brand, locations } from "@/data/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { tc } from "@/i18n/contentTranslations";

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="pt-16 pb-10 px-6 lg:px-10 bg-bgalt border-t border-line">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm text-inksoft">
        <div>
          <img src="/logo.png" alt="ANRA Health" className="h-12 w-auto mb-4" />
          <p>{t("footer.tagline")}</p>
        </div>
        <div>
          <p className="font-semibold mb-3 text-ink">{t("footer.contact")}</p>
          <p className="flex items-center gap-2 mb-2"><Phone size={13} /> {brand.phone}</p>
          <p className="flex items-center gap-2"><Mail size={13} /> {brand.email}</p>
        </div>
        <div>
          <p className="font-semibold mb-3 text-ink">{t("footer.locations")}</p>
          {locations.map((l) => (
            <p key={l.tag} className="mb-2">{tc(lang, "locations", l.tag, "tag", l.tag)} — {l.address.split(",")[0]}</p>
          ))}
        </div>
        <div>
          <p className="font-semibold mb-3 text-ink">{t("footer.quickLinks")}</p>
          <div className="flex flex-col gap-2">
            <Link href="/services" className="hover:text-blue transition-colors">{t("nav.services")}</Link>
            <Link href="/about" className="hover:text-blue transition-colors">{t("footer.aboutUs")}</Link>
            <Link href="/careers" className="hover:text-blue transition-colors">{t("nav.careers")}</Link>
            <Link href="/contact" className="hover:text-blue transition-colors">{t("nav.contact")}</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 text-xs border-t border-line text-inksoft">
        © {new Date().getFullYear()} {brand.name}. {t("footer.rights")}
      </div>
    </footer>
  );
}
