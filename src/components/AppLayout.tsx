import type { ReactNode } from "react"
import { Moon, Recycle, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { ICON, IconBox, TYPE } from "@/components/design-system"

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <IconBox variant="nav" accent="emerald" className="border">
              <Recycle />
            </IconBox>
            <span className={TYPE.cardTitle}>Pass It On</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={ICON.sm} /> : <Moon size={ICON.sm} />}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">{children}</main>

      <footer className="mx-auto max-w-2xl px-4 pb-8">
        <p className={TYPE.caption}>
          Built at Hack for Humanity Adelaide 2026. Charity rules come from each
          charity's own donation guide.
        </p>
      </footer>
    </div>
  )
}
