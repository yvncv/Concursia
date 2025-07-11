import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        rojo: "var(--rojo)",
        rosadoClaro: "var(--rosado-claro)",
        blanco: "var(--blanco)",
      },
    },
  },
  plugins: [],
} satisfies Config;
