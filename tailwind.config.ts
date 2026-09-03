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
        // BRAND v5 — "Glacier": light, cool, premium (current direction)
        // Same class names as before (pearl-*, gold-*, graphite-*) so no
        // component needs restructuring — only the hex values changed.
        // ─────────────────────────────────────────────────────────

        // pearl = surface/panel scale (frosted whites, light theme)
        pearl: {
          50: "#FFFFFF",   // ← frosted panel base
          100: "#F7F9FB",
          200: "#EFF1F6",  // ← ground mid-tone
          300: "#C9DFE4",  // ← hairline/border tint
          400: "#AEC9CF",
          500: "#8FB1B8",
          600: "#6E8F97",
          700: "#4F6B72",
          800: "#33474C",
          900: "#1A2528",
        },

        // gold = accent scale (glacier blue → deep teal)
        gold: {
          50: "#EAF3F5",
          100: "#DCEEF1",  // ← pulse/spark tint
          200: "#C8E4E9",
          300: "#A8D3DB",  // ← accent text
          400: "#8AC0CB",
          500: "#6EA8B6",  // ← primary accent (glacier blue)
          600: "#3F6F7C",  // ← deep teal (icons/labels/kickers)
          700: "#2E535D",
          800: "#1F3A41",
          900: "#101F23",
        },

        // graphite = ink/text scale (deep sage, never black)
        graphite: {
          50: "#F5F6F3",
          100: "#E8EBE6",
          200: "#D0D5CE",
          300: "#B4BBB2",
          400: "#98A196",
          500: "#7C8780",  // ← muted/placeholder text
          600: "#657166",  // ← secondary text
          700: "#546055",  // ← body text
          800: "#445048",
          900: "#3A463F",  // ← headings / most prominent text
        },

        // NEW — periwinkle secondary accent
        violet: {
          50: "#F3EFFA",
          100: "#EDE4F7",
          200: "#DCCEF0",
          300: "#C8A8E9",
          400: "#A788CF",
          500: "#8C6FB8",  // ← periwinkle
          600: "#6F5695",
          700: "#544073",
          800: "#3A2C50",
          900: "#211930",
        },

        // NEW — warm blush, single warm highlight accent
        blush: {
          50: "#FDF3F0",
          100: "#FBE6E0",
          200: "#F8D3C9",
          300: "#F3C3B2",  // ← blush highlight
          400: "#EBA895",
          500: "#DE8A73",
          600: "#C06E56",
          700: "#98543F",
          800: "#6E3C2C",
          900: "#45241A",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 40px rgba(110, 168, 182, 0.30)",       // glacier ambient glow
        glass: "0 8px 32px rgba(101, 113, 102, 0.14)",     // sage-tinted glass depth
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