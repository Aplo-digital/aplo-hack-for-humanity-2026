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
  panelTitle: "text-base font-semibold tracking-tight",
  /** Card titles */
  cardTitle: "font-heading text-lg leading-snug font-normal",
  /** Uppercase section labels */
  sectionLabel:
    "text-sm font-semibold tracking-wide text-muted-foreground uppercase",
  /** Body copy, descriptions */
  body: "text-base text-muted-foreground",
  bodyRelaxed: "text-base leading-relaxed text-muted-foreground",
  /** Form field labels */
  label: "text-base font-semibold text-foreground",
  /** Pill badges */
  badge: "h-7 px-2.5 text-sm font-medium tracking-wide",
  /** Meta captions: counts, helper text */
  caption: "text-base leading-snug text-muted-foreground",
} as const

export type TypographyScale = keyof typeof TYPE
