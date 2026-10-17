import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: "rgb(var(--clinical-50) / <alpha-value>)",
          100: "rgb(var(--clinical-100) / <alpha-value>)",
          200: "rgb(var(--clinical-200) / <alpha-value>)",
          300: "rgb(var(--clinical-300) / <alpha-value>)",
          400: "rgb(var(--clinical-400) / <alpha-value>)",
          500: "rgb(var(--clinical-500) / <alpha-value>)",
          600: "rgb(var(--clinical-600) / <alpha-value>)",
          700: "rgb(var(--clinical-700) / <alpha-value>)",
          800: "rgb(var(--clinical-800) / <alpha-value>)",
          900: "rgb(var(--clinical-900) / <alpha-value>)",
          950: "rgb(var(--clinical-950) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
