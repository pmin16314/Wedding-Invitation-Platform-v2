import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory:        "var(--ivory)",
        "ivory-deep": "var(--ivory-deep)",
        "ivory-border":"var(--ivory-border)",
        charcoal:     "var(--charcoal)",
        "charcoal-mid":"var(--charcoal-mid)",
        "charcoal-soft":"var(--charcoal-soft)",
        "charcoal-mute":"var(--charcoal-mute)",
        gold:         "var(--gold)",
        "gold-light": "var(--gold-light)",
        "gold-pale":  "var(--gold-pale)",
        rose:         "var(--rose)",
        "rose-pale":  "var(--rose-pale)",
        green:        "var(--green)",
        "green-pale": "var(--green-pale)",
        red:          "var(--red)",
        "red-pale":   "var(--red-pale)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body:    "var(--font-body)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontSize: {
        "2xs": "10px",
        xs:    "11px",
        sm:    "12px",
        base:  "13px",
        md:    "14px",
        lg:    "15px",
      },
    },
  },
  plugins: [],
};
export default config;
