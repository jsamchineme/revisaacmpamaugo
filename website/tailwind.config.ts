import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 configuration reference.
 * Primary token definitions live in app/globals.css via @theme.
 * This file provides backward compatibility with legacy config consumers.
 *
 * All values are pixel-accurate to templates/revisaacmpamaugo-reverent-timeless.html
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1c1a17",
        paper: "#faf7f2",
        cream: "#f3ede2",
        line: "#e3d9c8",
        gold: "#b08642",
        "gold-dark": "#8c6a32",
        burgundy: "#5a2231",
        "burgundy-dark": "#431824",
        muted: "#6b635a",
        white: "#ffffff",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        eyebrow: ["0.78rem", { lineHeight: "1.4", letterSpacing: "0.22em" }],
        tag: ["0.72rem", { lineHeight: "1.4", letterSpacing: "0.12em" }],
      },
      borderRadius: {
        DEFAULT: "14px",
        full: "50px",
        input: "10px",
      },
      boxShadow: {
        card: "0 18px 50px rgba(40,30,20,.12)",
      },
      spacing: {
        section: "6rem",
        "section-mobile": "4rem",
        header: "74px",
        "section-head-bottom": "56px",
      },
      maxWidth: {
        wrap: "1180px",
        faq: "780px",
        "section-head": "680px",
      },
    },
  },
};

export default config;
