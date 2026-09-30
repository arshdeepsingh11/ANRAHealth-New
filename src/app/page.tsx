"use client";

import React from "react";
import IntroExperience from "@/components/IntroExperience";
import HeroConcierge from "@/components/home/HeroConcierge";
import HealthHub from "@/components/home/HealthHub";
import LiveSignals from "@/components/home/LiveSignals";
import PrecisionFunnel from "@/components/home/PrecisionFunnel";
import AlbaConsole from "@/components/home/AlbaConsole";
import Ecosystem from "@/components/home/Ecosystem";
import TestGallery from "@/components/home/TestGallery";
import Locations from "@/components/home/Locations";
import FinalConcierge from "@/components/home/FinalConcierge";
import HealthInMotion from "@/components/home/HealthInMotion";
import { useIsMobile } from "@/lib/useViewport";

// Homepage — NEYU design system (Claude Design "NEYU Health", Home 01–07).
// The intro video (with skip) still plays first on a visitor's first load.
export default function Home() {
  const mobile = useIsMobile();

  return (
    <>
      <IntroExperience />
      {/* overflowX clip: the ecosystem orbit's pills swing past the screen edge on phones. */}
      <div className="anra-root" style={{ minHeight: "100vh", overflowX: "clip" }}>
        <a href="#main" className="anra-skip" style={{ position: "absolute", left: -9999, top: 8, background: "#14181B", color: "#F7F5F1", padding: "10px 14px", borderRadius: 8, zIndex: 200, textDecoration: "none" }}>Skip to content</a>
        {/* Right padding keeps content clear of the desktop nav rail. */}
        <main id="main" style={{ paddingRight: mobile ? 0 : 88 }}>
          <section data-screen-label="Home 01 Hero + Health map" style={{ position: "relative", overflow: "hidden", background: "radial-gradient(1100px 520px at 85% -8%, rgba(243,195,178,.32), transparent 60%),radial-gradient(900px 520px at 8% 4%, rgba(110,168,182,.16), transparent 60%),radial-gradient(700px 500px at 50% 70%, rgba(140,111,184,.08), transparent 70%)" }}>
            <anra-particles density="9000" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
            <HeroConcierge />
            <HealthHub mobile={mobile} />
          </section>
          <LiveSignals />
          <PrecisionFunnel />
          <AlbaConsole mobile={mobile} />
          <Ecosystem mobile={mobile} />
          <TestGallery mobile={mobile} />
          <Locations />
          <FinalConcierge />
          <HealthInMotion />
        </main>
      </div>
    </>
  );
}
