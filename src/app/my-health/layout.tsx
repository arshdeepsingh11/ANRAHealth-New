import type { Metadata, Viewport } from "next";
import "./portal.css";

// My Health Space — private patient area. Never indexed.
export const metadata: Metadata = {
  title: "My Health Space — NEYU Health",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#F6F4F1", viewportFit: "cover" };

export default function MyHealthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
