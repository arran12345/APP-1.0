import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cream-and-light-blue palette. Warm off-white surfaces with white
        // cards layered on top, soft beige borders, and a muted sky accent.
        bg: {
          DEFAULT: "#F5F0E1",      // cream
          elev: "#FFFFFF",         // raised surface (inputs, etc.)
          card: "#FFFFFF",         // card body
          hover: "#EDE7D3",        // hover surface on cream bg
        },
        line: {
          DEFAULT: "#E5DCC4",      // warm beige border
          strong: "#C9BE9F",       // emphasized border / focus ring base
        },
        ink: {
          DEFAULT: "#1E293B",      // slate-800, near-black text
          muted: "#5D7185",        // secondary text
          dim: "#94A4B7",          // tertiary text / placeholders
        },
        accent: {
          DEFAULT: "#5B9BD5",      // light blue — soft, distinctive
          soft: "#E1EFF8",         // accent-tinted background
          ink: "#FFFFFF",          // text on accent button
        },
        danger: "#DC2626",
        warn: "#D97706",
        ok: "#16A34A",
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
        card: "0 1px 2px 0 rgba(30, 41, 59, 0.04), 0 0 0 1px rgba(30, 41, 59, 0.03)",
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
