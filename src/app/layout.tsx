import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "@phosphor-icons/web/regular";
import "@phosphor-icons/web/fill";
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
import PageVisitTracker from "@/components/PageVisitTracker";
import { cn } from "@/lib/utils";

// DM Sans powers body and display text (Glacier / NEYU design system).
// 300 is included for the design's light weights.
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "NEYU Health — Advanced Cardiac & Internal Medicine Care",
  description: "NEYU Health brings cardiology, internal medicine, and endocrinology together in one Calgary clinic — with Alberta's first onsite Exercise Stress Echocardiogram program.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", dmSans.variable)}>
      <body
        className={`${dmSans.variable} font-sans min-h-screen text-graphite-900 overflow-x-hidden pb-24 min-[860px]:pb-0`}
        style={{ background: "#F7F6F2" }}
      >
        <LanguageProvider>
          <RegionProvider>
            <AlbaProvider>
              <MotionElements />
              <PageVisitTracker />
              {children}
              <Footer />
              {/* Universal chrome: nav rail / mobile tab bar + search, Neyu, safety screen. */}
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
