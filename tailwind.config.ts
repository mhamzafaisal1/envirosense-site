import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0f0d",
        surface: "#111c14",
        surfaceHover: "#162018",
        accent: "#4ade80",
        accentDim: "#22c55e",
        amber: "#f59e0b",
        textPrimary: "#f0faf3",
        textMuted: "#9ab8a0",
        border: "#1f3323"
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
