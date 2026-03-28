/**
 * Vowly Tailwind class helpers
 * Consistent class strings reused across admin + dashboard
 */

// Buttons
export const btn = {
  base:    "inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-[13px] font-medium font-body cursor-pointer border-none transition-all duration-150 no-underline whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",
  primary: "bg-charcoal text-white hover:bg-charcoal-mid",
  gold:    "bg-gold text-charcoal hover:bg-gold-light",
  outline: "bg-transparent text-charcoal border border-ivory-border hover:bg-ivory hover:border-charcoal-mute",
  ghost:   "bg-transparent text-charcoal-soft px-3 hover:bg-ivory hover:text-charcoal",
  danger:  "bg-red-pale text-red border border-red-pale/50 hover:bg-red-pale",
  success: "bg-green-pale text-green border border-green/20 hover:bg-green/20",
  sm:      "px-3 py-1.5 text-xs",
  lg:      "px-6 py-3 text-sm",
  icon:    "p-2 rounded-sm border border-ivory-border bg-white text-charcoal-soft hover:bg-ivory hover:text-charcoal",
};

// Cards
export const card = {
  base:    "bg-white border border-ivory-border rounded-lg overflow-hidden shadow-sm",
  header:  "flex items-center gap-3 px-6 py-[18px] border-b border-ivory-border",
  title:   "text-sm font-semibold text-charcoal",
  body:    "p-6",
  footer:  "px-6 py-4 border-t border-ivory-border bg-ivory flex items-center gap-2.5",
};

// Inputs
export const input = "w-full px-3.5 py-2.5 rounded-sm border border-ivory-border bg-white text-[13px] text-charcoal font-body transition-colors duration-150 outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 placeholder:text-charcoal-mute";
export const label = "text-[10px] tracking-[.1em] uppercase text-charcoal-soft font-medium";
export const textarea = `${input} resize-y min-h-[90px] leading-relaxed`;

// Badges
export const badge = {
  base:      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium",
  draft:     "bg-ivory-deep text-charcoal-soft border border-ivory-border",
  published: "bg-green-pale text-green",
  archived:  "bg-ivory-deep text-charcoal-mute",
  new:       "bg-gold-pale text-[#8B6914]",
  contacted: "bg-[#e8f0fe] text-[#1a56db]",
  paid:      "bg-green-pale text-green",
  converted: "bg-green-pale text-green",
  lost:      "bg-red-pale text-red",
  basic:     "bg-ivory-deep text-charcoal-soft border border-ivory-border",
  classic:   "bg-gold-pale text-[#8B6914]",
  premium:   "bg-gradient-to-br from-charcoal to-charcoal-mid text-gold-light",
};

// Spinner
export const spinner = "w-3.5 h-3.5 border-2 border-current/20 border-t-current rounded-full animate-spin-fast flex-shrink-0";
