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
        // BRAND v4 — Olive / Cream / Charcoal (current direction)
        // Same class names as v3 (gold-*, pearl-*, graphite-*) so no
        // component needs to change — only the hex values shifted.
        // ─────────────────────────────────────────────────────────

        // pearl = background/panel scale (dark olive-charcoal tiers)
        pearl: {
          50: "#3a3d2c",   // ← base panel / lightest tier
          100: "#313425",
          200: "#292c1e",
          300: "#23261a",  // ← borders
          400: "#1c1e15",
          500: "#181a11",  // ← mid background
          600: "#14160f",  // ← deepest background
          700: "#101208",
          800: "#0c0d06",
          900: "#080904",
        },

        // gold = accent scale (olive-green glow/accent)
        gold: {
          50: "#f4f6e8",
          100: "#e8f0a8",  // ← pulse/spark
          200: "#dbe49b",  // ← glowing script
          300: "#c3cd83",  // ← accent text
          400: "#aab568",
          500: "#99a455",  // ← primary accent
          600: "#7c8645",
          700: "#5f6935",
          800: "#3f4423",
          900: "#1f2211",
        },

        // graphite = text scale, inverted so 900 stays "most prominent"
        // (now brightest cream, since the theme is dark)
        graphite: {
          50: "#29251c",
          100: "#403a2c",
          200: "#574f3d",
          300: "#6e6650",
          400: "#857d60",  // ← muted/placeholder text
          500: "#9c9476",  // ← secondary text
          600: "#b3ab8f",
          700: "#cac2a9",  // ← body text
          800: "#ded7c2",
          900: "#f1ecdc",  // ← headings / brightest text
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
        glow: "0 0 40px rgba(153, 164, 85, 0.30)",         // olive ambient glow
        glass: "0 8px 32px rgba(8, 9, 4, 0.45)",             // glass panel depth on dark bg
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