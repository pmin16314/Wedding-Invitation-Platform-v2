/**
 * Vowly Invites — Icon Library
 * All SVG icons in one place. 16×16 viewBox, stroke="currentColor" unless noted.
 * Usage: import { IconGrid, IconHeart } from "@/components/icons";
 *
 * Size is controlled by className or width/height props on the parent or icon itself.
 * Default: 15×15 rendered, 16×16 viewBox.
 */

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// ── Navigation ─────────────────────────────────────────────────────

export function IconGrid({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <rect x="1" y="1" width="6" height="6" rx="1"/>
      <rect x="9" y="1" width="6" height="6" rx="1"/>
      <rect x="1" y="9" width="6" height="6" rx="1"/>
      <rect x="9" y="9" width="6" height="6" rx="1"/>
    </svg>
  );
}

export function IconHeart({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M8 13.5S1.5 9.5 1.5 5.5a3 3 0 015.3-1.9L8 5l1.2-1.4a3 3 0 015.3 1.9c0 4-6.5 8-6.5 8z"/>
    </svg>
  );
}

export function IconUsers({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <circle cx="6" cy="5" r="2.5"/>
      <path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M15 13c0-2.2-1.3-4-3-4.5"/>
    </svg>
  );
}

export function IconChat({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M14 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3l2 2 2-2h5a1 1 0 001-1V3a1 1 0 00-1-1z"/>
    </svg>
  );
}

export function IconGear({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
    </svg>
  );
}

export function EyeOpen({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
      <circle cx="8" cy="8" r="2"/>
    </svg>
  );
}

export function EyeClosed({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
      <path d="M4.6 4.6l6.8 6.8M11.4 4.6l-6.8 6.8"/>
    </svg>
  );
}

export function PhotoIcon({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
      <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
      <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
    </svg>
  );
}

export function LetterIcon({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
      <path
        fill-rule="evenodd"
        d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l3.235 1.94a2.8 2.8 0 0 0-.233 1.027L1 5.384v5.721l3.453-2.124q.219.416.55.835l-3.97 2.443A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741l-3.968-2.442q.33-.421.55-.836L15 11.105V5.383l-3.002 1.801a2.8 2.8 0 0 0-.233-1.026L15 4.217V4a1 1 0 0 0-1-1zm6 2.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132"
      />
    </svg>
  );
}

export function IconBell({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
    </svg>
  );
}

// ── Actions ────────────────────────────────────────────────────────

export function IconEdit({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M11 2l3 3-9 9H2v-3l9-9z"/>
    </svg>
  );
}

export function IconShare({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M10 2l4 4-4 4M14 6H5a3 3 0 00-3 3v3"/>
    </svg>
  );
}

export function IconCheck({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M3 8l3.5 3.5L13 4"/>
    </svg>
  );
}

export function IconCross({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M3 3l10 10M13 3L3 13"/>
    </svg>
  );
}

export function IconTrash({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"/>
    </svg>
  );
}

export function IconCopy({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <rect x="5" y="5" width="9" height="9" rx="1"/>
      <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2"/>
    </svg>
  );
}

export function IconUpload({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M8 10V2M5 5l3-3 3 3"/>
      <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1"/>
    </svg>
  );
}

export function IconExternalLink({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9"/>
      <path d="M10 2h4v4M14 2L8 8"/>
    </svg>
  );
}

export function IconPlus({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M8 2v12M2 8h12"/>
    </svg>
  );
}

export function IconMinus({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M2 8h12"/>
    </svg>
  );
}

export function IconChevronDown({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M3 6l5 5 5-5"/>
    </svg>
  );
}

export function IconChevronRight({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M6 3l5 5-5 5"/>
    </svg>
  );
}

export function IconArrowLeft({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M10 3L5 8l5 5"/>
    </svg>
  );
}

// ── Media / Content ────────────────────────────────────────────────

export function IconPhoto({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <rect x="1" y="3" width="14" height="10" rx="1.5"/>
      <circle cx="8" cy="8" r="2.5"/>
    </svg>
  );
}

export function IconCamera({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M1 5.5A1.5 1.5 0 012.5 4H4l1-2h6l1 2h1.5A1.5 1.5 0 0115 5.5v7A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5v-7z"/>
      <circle cx="8" cy="9" r="2.5"/>
    </svg>
  );
}

export function IconCalendar({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <rect x="1" y="2" width="14" height="13" rx="1.5"/>
      <path d="M5 1v3M11 1v3M1 7h14"/>
    </svg>
  );
}

export function IconStar({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.4l-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z"/>
    </svg>
  );
}

export function IconMail({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <rect x="1" y="3" width="14" height="10" rx="1.5"/>
      <path d="M1 4l7 5 7-5"/>
    </svg>
  );
}

export function IconPhone({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M3 1.5h3l1.5 3.5-1.75 1.05a7.5 7.5 0 003.7 3.7L10.5 8l3.5 1.5V13A1.5 1.5 0 0112.5 14.5C6.4 14.5 1.5 9.6 1.5 3.5A1.5 1.5 0 013 2z"/>
    </svg>
  );
}

export function IconMap({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.5-2-4.5-4.5-4.5z"/>
      <circle cx="8" cy="6" r="1.5"/>
    </svg>
  );
}

// ── Status / Feedback ──────────────────────────────────────────────

export function IconInfo({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <circle cx="8" cy="8" r="7"/>
      <path d="M8 7v5M8 5v.01"/>
    </svg>
  );
}

export function IconWarning({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M8 1L1 14h14L8 1z"/>
      <path d="M8 6v4M8 11v.01"/>
    </svg>
  );
}

export function IconLock({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <rect x="2" y="7" width="12" height="8" rx="1.5"/>
      <path d="M5 7V5a3 3 0 016 0v2"/>
    </svg>
  );
}

export function IconEye({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
      <circle cx="8" cy="8" r="2"/>
    </svg>
  );
}

export function IconRefresh({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <path d="M13.5 8A5.5 5.5 0 112.5 5"/>
      <path d="M2 2v3h3"/>
    </svg>
  );
}

export function IconDrag({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 16" fill="currentColor" className={className}>
      <circle cx="3" cy="3"  r="1.5"/>
      <circle cx="7" cy="3"  r="1.5"/>
      <circle cx="3" cy="8"  r="1.5"/>
      <circle cx="7" cy="8"  r="1.5"/>
      <circle cx="3" cy="13" r="1.5"/>
      <circle cx="7" cy="13" r="1.5"/>
    </svg>
  );
}

// ── Brand / Social ─────────────────────────────────────────────────

/** WhatsApp logo — filled, 24×24 viewBox */
export function IconWhatsApp({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M11.99 0C5.364 0 0 5.363 0 11.989c0 2.117.556 4.107 1.527 5.832L0 24l6.335-1.652A11.96 11.96 0 0011.99 24c6.626 0 11.99-5.363 11.99-11.989C23.98 5.363 18.616 0 11.99 0zm0 21.818a9.803 9.803 0 01-5.002-1.368l-.359-.213-3.76.984 1.003-3.667-.234-.376A9.808 9.808 0 012.182 11.99c0-5.413 4.396-9.808 9.808-9.808 5.413 0 9.808 4.395 9.808 9.808 0 5.412-4.395 9.828-9.808 9.828z"/>
    </svg>
  );
}

export function IconDesign({ size = 15, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
      <circle cx="8" cy="8" r="2"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/>
    </svg>
  );
}
