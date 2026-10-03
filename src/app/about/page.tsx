import type { Metadata } from "next";
import { NeyuPage } from "@/components/neyu/kit";
import AboutPage from "@/components/neyu/pages/About";

export const metadata: Metadata = { title: "About · NEYU Health", description: "The NEYU story: Alberta's first onsite exercise stress echocardiogram program, a multilingual team, and the philosophy Listen · Connect · Flourish." };

export default function Page() {
  return <NeyuPage><AboutPage /></NeyuPage>;
}
