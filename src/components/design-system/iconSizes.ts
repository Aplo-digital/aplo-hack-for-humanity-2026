/** Icon sizes in px. Pass to Lucide icons (or use Icon / IconBox) so sizes stay uniform. */
export const ICON = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
} as const

export type IconSize = keyof typeof ICON
