"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Clock, Send } from "lucide-react";
import { locations, brand } from "@/data/content";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div style={{ background: "linear-gradient(160deg, #faf8f3 0%, #f2ede0 45%, #ece2cd 100%)", minHeight: "100vh" }}>
      <Link
        href="/"
        className="fixed top-5 left-5 z-40 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 glass rounded-full px-4 py-2.5 transition-transform hover:-translate-x-0.5"
      >
        <ArrowLeft size={15} /> Back to Main Page
      </Link>

      <div className="text-center pt-24 pb-12 px-6">
        <p className="text-sm font-semibold tracking-wide uppercase mb-2 text-gold-600 font-display italic">Get in touch</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-graphite-900">Contact</h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {locations.map((loc) => (
            <div key={loc.tag} className="glass rounded-3xl p-8 card-hover">
              <p className="text-xs font-semibold tracking-wide uppercase mb-2 text-gold-600">{loc.tag}</p>
              <h3 className="text-xl font-bold mb-5 text-graphite-900">{loc.name}</h3>
              <div className="space-y-2.5 text-sm text-graphite-600 mb-6">
                <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-gold-600" /> {loc.address}</p>
                <p className="flex items-center gap-2"><Phone size={15} className="shrink-0 text-gold-600" /> {loc.phone}</p>
                <p className="flex items-center gap-2"><Clock size={15} className="shrink-0 text-gold-600" /> {brand.hours}</p>
              </div>
              <iframe
                title={loc.name}
                className="w-full h-44 rounded-2xl border-0"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(loc.address)}&output=embed`}
              />
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8 md:p-10 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-graphite-900">Send us a message</h2>
          {sent ? (
            <p className="text-sm text-graphite-600">Thanks — we've received your message and will be in touch shortly.</p>
          ) : (
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input placeholder="Full name" className="px-4 py-3 rounded-xl border border-pearl-300 bg-white text-sm outline-none focus:border-gold-500" />
                <input type="tel" placeholder="Phone number" className="px-4 py-3 rounded-xl border border-pearl-300 bg-white text-sm outline-none focus:border-gold-500" />
              </div>
              <input type="email" placeholder="Email address" className="px-4 py-3 rounded-xl border border-pearl-300 bg-white text-sm outline-none focus:border-gold-500" />
              <textarea rows={4} placeholder="How can we help?" className="px-4 py-3 rounded-xl border border-pearl-300 bg-white text-sm outline-none focus:border-gold-500 resize-none" />
              <button
                onClick={() => setSent(true)}
                className="gold-gloss inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105"
              >
                Send Message <Send size={15} />
              </button>
              <p className="text-xs text-graphite-400">Email delivery isn't configured yet — this form won't send until a mail service is added.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}