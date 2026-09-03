import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AlbaProvider } from "@/components/AlbaContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AlbaWidget from "@/components/AlbaWidget";
import AlbaFactPopup from "@/components/AlbaFactPopup";
import PersistentActions from "@/components/PersistentActions";
import ParticleField from "@/components/ParticleField";
import PageVisitTracker from "@/components/PageVisitTracker";
import { cn } from "@/lib/utils";

// DM Sans now powers both body text and headings/display text, per the
// Glacier design direction — replaces Geist, Space Grotesk, and Manrope.
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-dm-sans" });
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
        className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans min-h-screen text-graphite-900 overflow-x-hidden`}
        style={{ background: "radial-gradient(125% 105% at 18% 0%, #F4E7FB 0%, #EFF1F6 45%, #DAEBE3 100%)" }}
      >
        <LanguageProvider>
          <AlbaProvider>
            <PageVisitTracker />
            <ParticleField color="120, 96, 164" />
            <Navbar />
            {children}
            <Footer />
            <PersistentActions />
            <AlbaWidget />
            <AlbaFactPopup />
          </AlbaProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}