/**
 * Typography scale. Mobile-first: base sizes, scaling up at sm/md breakpoints.
 */
export const TYPE = {
  /** Page h1 */
  pageTitle:
    "font-heading text-[1.75rem] leading-[1.15] font-[350] tracking-tight",
  /** Section h2, empty states */
  sectionTitle: "font-heading text-xl leading-snug font-normal",
  /** Small panel headers */
  panelTitle: "text-sm font-semibold tracking-tight",
  /** Card titles */
  cardTitle: "font-heading text-lg leading-snug font-normal",
  /** Uppercase section labels */
  sectionLabel:
    "text-[11px] font-semibold tracking-widest text-muted-foreground uppercase",
  /** Body copy, descriptions */
  body: "text-sm text-muted-foreground",
  bodyRelaxed: "text-sm leading-relaxed text-muted-foreground",
  /** Form field labels */
  label: "text-xs font-semibold text-muted-foreground",
  /** Pill badges */
  badge: "text-[11px] font-medium tracking-wide",
  /** Meta captions: counts, helper text */
  caption: "text-xs text-muted-foreground",
} as const

export type TypographyScale = keyof typeof TYPE
