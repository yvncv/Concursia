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
        title: "var(--title)",
        subTitle: "var(--subTitle)",
        normalText: "var(--normalText)",
        bgTitle: "var(--bgTitle)",
        bgSubTitle: "var(--subTitle)",
        bgNormalText: "var(--normalText)",
      },
    },
  },
  plugins: [],
} satisfies Config;
