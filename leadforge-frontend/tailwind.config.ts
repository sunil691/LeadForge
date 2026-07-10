import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0B0B0F",
        surface: "#15171B",
        "surface-raised": "#1E2025",
        "surface-line": "#25272C",
        forge: {
          DEFAULT: "#FF6B2C",
          soft: "#FFA07A",
        },
        steel: "#5B8AA6",
        ash: "#9CA3AF",
        warm: "#FFFFFF",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        ember: "0 0 24px -4px rgba(255, 107, 44, 0.35)",
        "ember-lg": "0 0 48px -8px rgba(255, 107, 44, 0.4)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 6px 1px rgba(255,107,44,0.7)" },
          "50%": { opacity: "0.55", boxShadow: "0 0 2px 0px rgba(255,107,44,0.3)" },
        },
        drift: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.9" },
          "100%": { transform: "translateY(-140px) translateX(12px)", opacity: "0" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.2s ease-in-out infinite",
        drift: "drift 6s ease-in infinite",
        riseIn: "riseIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
