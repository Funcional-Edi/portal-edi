import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}",
    "./core/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0b2426",
          50: "#f1f8f7",
          100: "#d9ece9",
          200: "#b8d9d5",
          300: "#8bbdb8",
          400: "#5b9d96",
          500: "#328078",
          600: "#17665f",
          700: "#0d504c",
          800: "#0a3c3b",
          900: "#0b2426",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
