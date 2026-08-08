import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

// next/font/google self-hosts the Inter font at build time (no external
// request to fonts.googleapis.com at runtime) — same font as before,
// faster and works fully offline / self-hosted.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ANRA Health — Advanced Cardiac & Internal Medicine Care",
  description:
    "ANRA Health brings cardiology, internal medicine, and endocrinology together in one Calgary clinic — with Alberta's first onsite Exercise Stress Echocardiogram program.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white text-ink overflow-x-hidden`}>
        <LanguageProvider>
          <Navbar />
          {children}
          <Footer />
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
