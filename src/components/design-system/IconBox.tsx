import React, { type ReactNode } from "react"
import { ICON, type IconSize } from "./iconSizes"
import { colorBoxStyles } from "./accentStyles"

type IconBoxVariant = "badge" | "card" | "nav" | "hero" | "legend" | "inline"
type IconChildProps = { className?: string; size?: number }

const VARIANT_STYLES: Record<
  IconBoxVariant,
  { box: string; iconSize: number }
> = {
  badge: { box: "w-6 h-6 rounded-lg", iconSize: ICON.sm },
  card: { box: "w-12 h-12 rounded-xl border", iconSize: ICON["2xl"] },
  nav: { box: "w-8 h-8 rounded-lg", iconSize: ICON.md },
  hero: { box: "w-14 h-14 rounded-2xl border", iconSize: ICON["2xl"] },
  legend: { box: "w-10 h-10 rounded-lg border", iconSize: ICON.lg },
  inline: { box: "w-10 h-10 rounded-xl border", iconSize: ICON.xl },
}

interface IconBoxProps {
  variant: IconBoxVariant
  /** Accent color key for colored backgrounds (card, legend, inline) */
  accent?: keyof typeof colorBoxStyles
  /** Additional class names for the container */
  className?: string
  /** Lucide icon element - will be cloned with consistent size */
  children: ReactNode
}

/** Renders an icon with consistent container size. Clones child with correct icon size. */
export function IconBox({
  variant,
  accent,
  className = "",
  children,
}: IconBoxProps) {
  const { box, iconSize } = VARIANT_STYLES[variant]
  const colorClasses = accent ? (colorBoxStyles[accent]?.box ?? "") : ""
  const colorIconClasses = accent ? (colorBoxStyles[accent]?.icon ?? "") : ""

  const existingClass = React.isValidElement(children)
    ? ((children as React.ReactElement<IconChildProps>).props.className ?? "")
    : ""
  const clonedIcon = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<IconChildProps>, {
        size: iconSize,
        className: `flex-shrink-0 ${existingClass}`.trim(),
      })
    : children

  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center [&>svg]:flex-shrink-0 ${box} ${colorClasses} ${className}`.trim()}
    >
      <span className={colorIconClasses}>{clonedIcon}</span>
    </span>
  )
}

/** Wrapper for standalone icons (no box) - use when icon sits inline in text/badge */
export function Icon({
  size = "sm",
  className = "",
  children,
}: {
  size?: IconSize
  className?: string
  children: ReactNode
}) {
  const px = ICON[size]
  const existingClass = React.isValidElement(children)
    ? ((children as React.ReactElement<IconChildProps>).props.className ?? "")
    : ""
  const clonedIcon = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<IconChildProps>, {
        size: px,
        className: `flex-shrink-0 ${existingClass}`.trim(),
      })
    : children
  return (
    <span
      className={`inline-flex flex-shrink-0 [&>svg]:flex-shrink-0 ${className}`.trim()}
    >
      {clonedIcon}
    </span>
  )
}

export { ICON }
