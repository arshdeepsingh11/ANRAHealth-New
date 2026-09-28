import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "@phosphor-icons/web/regular";
import "./globals.css";
import "./anra.css";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AlbaProvider } from "@/components/AlbaContext";
import { RegionProvider } from "@/components/RegionContext";
import NavChrome from "@/components/NavChrome";
import Footer from "@/components/Footer";
import AlbaWidget from "@/components/AlbaWidget";
import AlbaFactPopup from "@/components/AlbaFactPopup";
import EmergencyOverlay from "@/components/EmergencyOverlay";
import MotionElements from "@/components/MotionElements";
import ParticleField from "@/components/ParticleField";
import PageVisitTracker from "@/components/PageVisitTracker";
import { cn } from "@/lib/utils";

// DM Sans powers body and display text (Glacier / ANRA design system).
// 300 is included for the design's light weights.
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-dm-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "ANRA Health — Advanced Cardiac & Internal Medicine Care",
  description: "ANRA Health brings cardiology, internal medicine, and endocrinology together in one Calgary clinic — with Alberta's first onsite Exercise Stress Echocardiogram program.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", dmSans.variable)}>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans min-h-screen text-graphite-900 overflow-x-hidden pb-24 min-[860px]:pb-0`}
        style={{ background: "radial-gradient(125% 105% at 18% 0%, #F4E7FB 0%, #EFF1F6 45%, #DAEBE3 100%)" }}
      >
        <LanguageProvider>
          <RegionProvider>
            <AlbaProvider>
              <MotionElements />
              <PageVisitTracker />
              {/* Global background particles — the homepage renders its own. */}
              <ParticleField color="120, 96, 164" />
              {children}
              <Footer />
              {/* Universal chrome: nav rail / mobile tab bar + search, ALBA, safety screen. */}
              <NavChrome />
              <AlbaWidget />
              <AlbaFactPopup />
              <EmergencyOverlay />
            </AlbaProvider>
          </RegionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}