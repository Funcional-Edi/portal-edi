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
          DEFAULT: "#0f766e",
          50: "#f0fdfa",
          600: "#0d9488",
          700: "#0f766e",
          900: "#134e4a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
