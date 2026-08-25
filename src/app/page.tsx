"use client";

import React from "react";
import IntroExperience from "@/components/IntroExperience";
import HealthGraph from "@/components/HealthGraph";

export default function Home() {
  return (
    <>
      <IntroExperience />
      <section
        className="pt-16 pb-16 md:pt-20 md:pb-20 px-6"
        style={{ background: "linear-gradient(160deg, #23261a 0%, #181a11 45%, #0d0e0a 100%)", minHeight: "100vh" }}
      >
        <div className="text-center mb-10 md:mb-12">
          <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">
            ANRA Health
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-[1.15] text-graphite-900">
            Healthcare Designed Around You
          </h1>
        </div>

        <HealthGraph />
      </section>
    </>
  );
}