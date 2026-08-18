import type { Metadata } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LayoutChrome from "@/components/LayoutChrome";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-space-grotesk" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "ANRA Health — Advanced Cardiac & Internal Medicine Care",
  description: "ANRA Health brings cardiology, internal medicine, and endocrinology together in one Calgary clinic — with Alberta's first onsite Exercise Stress Echocardiogram program.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-white text-ink overflow-x-hidden`}>
        <LanguageProvider>
          <Navbar />
          {children}
          <Footer />
          <LayoutChrome />
        </LanguageProvider>
      </body>
    </html>
  );
}