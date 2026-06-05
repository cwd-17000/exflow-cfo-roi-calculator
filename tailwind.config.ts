import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#400685",
        muted: "#76658f",
        mist: "#f4effb",
        pine: "#5b1bb0",
        aqua: "#24d37a",
        gold: "#ff9f45",
        cream: "#fbf8ff"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(11, 0, 32, 0.22)",
        line: "inset 0 0 0 1px rgba(64, 6, 133, 0.1)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
