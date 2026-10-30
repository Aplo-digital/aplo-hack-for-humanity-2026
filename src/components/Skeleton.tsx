import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

/**
 * Loading placeholder with a shimmer sweep. Drop it where content will land —
 * size it with utility classes (h-*, w-*, rounded-*). The shimmer keyframes
 * live in globals.css (`.skeleton-shimmer`) so every loader matches.
 */
export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  )
}
