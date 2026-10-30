/**
 * Typography scale. Mobile-first: base sizes, scaling up at sm/md breakpoints.
 */
export const TYPE = {
  /** Page h1 */
  pageTitle: "text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl",
  /** Section h2, empty states */
  sectionTitle: "text-base font-semibold tracking-tight sm:text-lg",
  /** Small panel headers */
  panelTitle: "text-sm font-semibold tracking-tight",
  /** Card titles */
  cardTitle: "text-base font-semibold tracking-tight",
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
