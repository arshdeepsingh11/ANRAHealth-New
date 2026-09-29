"use client";
export default function PrintButton() {
  return <button onClick={() => window.print()} style={{ height: 40, padding: "0 16px", border: "1px solid rgba(29,35,39,.12)", borderRadius: 10, background: "#FFFDFB", fontSize: 14, cursor: "pointer" }}>Print / save as PDF</button>;
}
