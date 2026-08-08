import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
