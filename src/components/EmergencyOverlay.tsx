"use client";

import React, { useEffect } from "react";
import { useAlba } from "@/components/AlbaContext";

// Full-screen safety screen. Shown whenever the emergency safety net fires
// (Neyu, the homepage concierge, or the server's emergency response).
export default function EmergencyOverlay() {
  const { emergency, closeEmergency } = useAlba();

  useEffect(() => {
    if (!emergency) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [emergency]);

  if (!emergency) return null;

  const li: React.CSSProperties = { padding: "16px 0", borderBottom: "1px solid #EFC9C0", display: "flex", gap: 14, color: "#3A1510", fontSize: 17 };

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="emerg-title" className="anra-chrome" style={{ position: "fixed", inset: 0, zIndex: 120, background: "#FFF6F3", overflow: "auto", animation: "fadeUp .2s ease" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(40px,8vw,96px) clamp(20px,4vw,40px)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#9B2317", fontWeight: 600, letterSpacing: ".12em", fontSize: 13, textTransform: "uppercase" }}><i className="ph ph-warning" style={{ fontSize: 22 }} />Safety</div>
        <h1 id="emerg-title" style={{ margin: "16px 0 0", fontSize: "clamp(40px,7vw,72px)", lineHeight: 1, letterSpacing: "-.04em", fontWeight: 600, color: "#5E140C" }}>Please seek urgent medical care.</h1>
        <p style={{ margin: "20px 0 0", fontSize: 20, lineHeight: 1.5, color: "#3A1510", maxWidth: 600 }}>What you’ve described can be a sign of a condition that needs immediate attention. Don’t wait for an online answer.</p>
        <a href="tel:911" style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 64, maxWidth: 420, borderRadius: 14, background: "#B42318", color: "#FFFFFF", textDecoration: "none", fontSize: 18, fontWeight: 700, letterSpacing: ".08em" }}><i className="ph ph-phone" style={{ fontSize: 24 }} />CALL 911</a>
        <ul style={{ margin: "32px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 0, maxWidth: 600, borderTop: "1px solid #EFC9C0" }}>
          <li style={li}><i className="ph ph-hospital" style={{ fontSize: 22, color: "#9B2317" }} />Go to the nearest emergency department. Don’t drive yourself if you feel unwell.</li>
          <li style={li}><i className="ph ph-person-simple" style={{ fontSize: 22, color: "#9B2317" }} />Stop what you’re doing and sit or lie down. If someone is nearby, tell them.</li>
          <li style={li}><i className="ph ph-phone-call" style={{ fontSize: 22, color: "#9B2317" }} /><span>If you’re unsure, Health Link <a href="tel:811" style={{ color: "#9B2317", fontWeight: 600 }}>811</a> offers 24/7 nurse advice in Alberta. For thoughts of self-harm, call or text <a href="tel:988" style={{ color: "#9B2317", fontWeight: 600 }}>988</a>.</span></li>
        </ul>
        <button onClick={closeEmergency} style={{ marginTop: 28, border: 0, background: "none", padding: "10px 0", color: "#5E140C", textDecoration: "underline", textUnderlineOffset: 3, fontSize: 15 }}>I’m not experiencing an emergency. Go back.</button>
      </div>
    </div>
  );
}
