import type { ReactNode } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[env(safe-area-inset-top)]">
        <header className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="font-heading text-base">looped</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={ICON.sm} /> : <Moon size={ICON.sm} />}
          </Button>
        </header>

        <main className="flex flex-1 flex-col pt-2">{children}</main>

        <footer className="pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className={TYPE.caption}>
            Built at Hack for Humanity Adelaide 2026. Charity rules come from
            each charity's own donation guide.
          </p>
        </footer>
      </div>
    </div>
  )
}

/** Sticky bottom area for a step's main actions. Put it last in the step. */
export function ActionBar({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-40 -mx-5 mt-auto flex flex-col gap-3 bg-linear-to-t from-background from-75% to-transparent px-5 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      {children}
    </div>
  )
}

function LogoMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 text-pine"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 12c-2-2.7-3.6-4-5.5-4a4 4 0 0 0 0 8c1.9 0 3.5-1.3 5.5-4Zm0 0c2 2.7 3.6 4 5.5 4a4 4 0 0 0 0-8c-1.9 0-3.5 1.3-5.5 4Z" />
    </svg>
  )
}
