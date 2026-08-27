"use client";

import React from "react";
import Link from "next/link";
import { X, ExternalLink, ShieldCheck, Salad, AlertTriangle, ArrowRight } from "lucide-react";
import type { HealthFact } from "@/data/healthFacts";

interface HealthFactModalProps {
  fact: HealthFact;
  onClose: () => void;
}

export default function HealthFactModal({ fact, onClose }: HealthFactModalProps) {
  const detail = fact.detail;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(8,9,4,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="glass rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-7 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-1">
          {detail?.source && (
            <a
              href={detail.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold-600 hover:text-gold-700"
            >
              Source: {detail.source.name} <ExternalLink size={11} />
            </a>
          )}
          <button onClick={onClose} className="text-graphite-400 hover:text-graphite-700 ml-auto shrink-0">
            <X size={20} />
          </button>
        </div>

        <p className="text-lg font-display font-semibold text-graphite-900 leading-snug mt-3 mb-6">
          {fact.text}
        </p>

        {detail?.symptoms && detail.symptoms.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle size={15} className="text-gold-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Early Symptoms & Signs</p>
            </div>
            <ul className="space-y-1.5">
              {detail.symptoms.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-graphite-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {detail?.prevention && detail.prevention.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <Salad size={15} className="text-gold-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Prevention</p>
            </div>
            <ul className="space-y-1.5">
              {detail.prevention.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-graphite-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {detail?.precautions && detail.precautions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <ShieldCheck size={15} className="text-gold-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">Things To Be Careful About</p>
            </div>
            <ul className="space-y-1.5">
              {detail.precautions.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-graphite-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-pearl-200 pt-5 mt-2">
          <p className="text-sm font-bold text-graphite-900 leading-relaxed mb-4">
            If you're still unsure, you can book a consultation with us — we'll take care of this.
          </p>
          <Link
            href="/referral-centre"
            onClick={onClose}
            className="gold-gloss inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Book a Consultation <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}