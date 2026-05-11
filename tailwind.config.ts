import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Engineering-inspired neutral palette + a single accent.
        // Surfaces use subtle steps so cards read clearly on dark mode.
        bg: {
          DEFAULT: "#0A0A0B",
          elev: "#111113",
          card: "#141416",
          hover: "#1A1A1D",
        },
        line: {
          DEFAULT: "#1F1F23",
          strong: "#2A2A30",
        },
        ink: {
          DEFAULT: "#F5F5F7",
          muted: "#8A8A93",
          dim: "#5A5A63",
        },
        accent: {
          DEFAULT: "#A3E635",      // lime — high-energy, distinctive
          soft: "#3A4A1F",
          ink: "#0A0A0B",
        },
        danger: "#F87171",
        warn: "#FBBF24",
        ok: "#4ADE80",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Roboto",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "JetBrains Mono",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        // Tighter hierarchy. Display numerals use mono-tabular feel.
        "2xs": ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.04em" }],
      },
      borderRadius: {
        DEFAULT: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
      },
      boxShadow: {
        card: "0 0 0 1px rgba(255,255,255,0.04), 0 1px 0 0 rgba(255,255,255,0.02) inset",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
        "pop": "pop 160ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
