/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ba: {
          bg: "#0a0a0f",
          surface: "#14141e",
          surface2: "#1e1e2e",
          accent: "#6c63ff",
          accent2: "#ff6b9d",
          green: "#4ade80",
          red: "#f87171",
          yellow: "#fbbf24",
          text: "#f0f0f8",
          muted: "rgba(240, 240, 248, 0.45)",
        },
        border: {
          ba: "rgba(255, 255, 255, 0.08)",
        },
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
