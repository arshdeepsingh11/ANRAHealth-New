import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─────────────────────────────────────────────────────────
        // LEGACY (v1 tokens) — kept so existing pages don't break.
        // Remove per-page as each is migrated in Phases 2–7.
        // ─────────────────────────────────────────────────────────
        ink: "#2C3E50",
        inksoft: "#6B7C8C",
        line: "#E7ECF1",
        bgalt: "#F7FAFC",
        blue: "#3B7EA1",
        bluesoft: "#EAF3F7",
        coral: "#D65A5A",
        coralsoft: "#FBEDED",
        mint: "#DCEFE7",
        mintdeep: "#3E9C7A",

        // ─────────────────────────────────────────────────────────
        // BRAND v3 — Glass / Pearl / Gold (current direction)
        // Supersedes the navy/teal/precision-green v2 block — those
        // tokens were never applied to any page, safe removal.
        // ─────────────────────────────────────────────────────────
        pearl: {
          50: "#F7F5F0", // ← base background
          100: "#EFEDE9", 200: "#E9E3D5", 300: "#D7CDB4", 400: "#C2B28C",
          500: "#AB9661", 600: "#8D7A4B", 700: "#695B38", 800: "#413823",
          900: "#201B11",
        },
        gold: {
          50: "#EFEBDC", 100: "#EAE4D2", 200: "#F0E1B2", 300: "#E8D188",
          400: "#DEBD54", 500: "#C9A227", // ← accent (buttons/icons/highlights)
          600: "#9E801F", 700: "#6F5A16", 800: "#3C300C", 900: "#110E03",
        },
        graphite: {
          50: "#F7F6F6", 100: "#F0EFEE", 200: "#E5E3DF", 300: "#CECAC2",
          400: "#B3ADA0", 500: "#968D7B", 600: "#7C7363", 700: "#5C564A",
          800: "#3A362F", 900: "#1E1C18", // ← body text / headings
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 40px rgba(201, 162, 39, 0.30)",       // gold ambient glow
        glass: "0 8px 32px rgba(30, 28, 24, 0.08)",        // glass panel depth
      },
      backdropBlur: {
        glass: "20px",
      },
      keyframes: {
        pulseWave: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        sheen: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      animation: {
        "pulse-wave": "pulseWave 2.4s linear infinite",
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite",
        sheen: "sheen 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;