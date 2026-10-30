import { useMemo, useState, type ReactNode } from "react"
import { Heart, Leaf, RotateCcw, Share2, Users } from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"
import { impactOf, type Impact } from "@/lib/impact"
import { CATEGORY_LABELS } from "@/lib/labels"
import type { Item } from "@/lib/types"

type ShareState = "idle" | "copied" | "failed"

export function ImpactStep({
  items,
  onBackToPlan,
  onStartAgain,
}: {
  items: Item[]
  onBackToPlan: () => void
  onStartAgain: () => void
}) {
  const impact = useMemo(() => impactOf(items), [items])
  const [share, setShare] = useState<ShareState>("idle")

  async function onShare() {
    const text = shareText(impact)
    if (navigator.share) {
      try {
        await navigator.share({ title: "looped", text })
        return
      } catch (error) {
        if ((error as Error).name === "AbortError") return
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShare("copied")
    } catch {
      setShare("failed")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col gap-3 pt-2">
        <h1 className={TYPE.pageTitle}>A gentler kind of goodbye</h1>
        <p className={TYPE.bodyRelaxed}>
          You chose to pass these on. They get another ordinary week in someone
          else's home, instead of a last one at the tip.
        </p>
      </div>

      <section className="flex flex-col items-center gap-2 rounded-3xl bg-sage px-6 py-10 text-center">
        <Heart
          size={36}
          className="mb-1 fill-terracotta text-terracotta"
          aria-hidden
        />
        <p className="font-heading text-5xl leading-none font-[350] tracking-tight">
          About {formatKg(impact.kg)} kg
        </p>
        <p className="max-w-[16rem] text-base leading-relaxed text-muted-foreground">
          still out in the world, doing a job
        </p>
      </section>

      <p className="px-2 text-center font-heading text-2xl leading-snug font-[350] text-balance">
        {kindLine(impact)}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon={<Users size={ICON.lg} className="text-pine" />}
          value={`About ${impact.households}`}
          label={
            impact.households === 1
              ? "home this can land in"
              : "homes this can land in"
          }
        />
        <StatTile
          icon={<Leaf size={ICON.lg} className="text-pine" />}
          value={`About ${impact.co2eKg} kg`}
          label="of carbon kept quiet"
        />
      </div>

      {impact.byCategory.length > 0 && (
        <ul className="flex flex-col gap-2">
          {impact.byCategory.map(({ category, count }) => (
            <li
              key={category}
              className="flex items-center justify-between rounded-2xl bg-card px-4 py-4 ring-1 ring-border"
            >
              <span className="text-base">{CATEGORY_LABELS[category]}</span>
              <span className="text-base text-muted-foreground tabular-nums">
                {count} {count === 1 ? "thing" : "things"} moving on
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className={cn(TYPE.caption, "px-2 text-center leading-relaxed")}>
        These are gentle guesses from typical weights. Carbon assumes about 2 kg
        saved for every kilogram reused. The feeling is the real part.
      </p>

      <ActionBar>
        {share !== "idle" && (
          <p className={cn(TYPE.caption, "text-center")} role="status">
            {share === "copied"
              ? "Copied. Share it wherever you like."
              : "Couldn't share just now."}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={onShare}
          >
            <Share2 size={ICON.md} />
            Share
          </Button>
          <Button size="lg" className="flex-[1.4]" onClick={onBackToPlan}>
            Back to the plan
          </Button>
        </div>
        <Button
          variant="ghost"
          className="self-center text-muted-foreground"
          onClick={onStartAgain}
        >
          <RotateCcw size={ICON.sm} />
          Start again
        </Button>
      </ActionBar>
    </div>
  )
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: ReactNode
  value: string
  label: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-sage px-4 py-5">
      {icon}
      <span className="font-heading text-2xl leading-none font-[350]">
        {value}
      </span>
      <span className="text-base leading-snug text-muted-foreground">{label}</span>
    </div>
  )
}

const formatKg = (kg: number) =>
  kg >= 10 ? Math.round(kg).toString() : kg.toString()

function kindLine({ biggest }: Impact): string {
  if (!biggest) return "Every small yes keeps something in the loop."
  const name = /^[A-Z][a-z]/.test(biggest.name)
    ? biggest.name[0].toLowerCase() + biggest.name.slice(1)
    : biggest.name
  return biggest.quantity > 1
    ? `Your ${name} are off toward a new lounge, a new week, a new someone.`
    : `Your ${name} is off toward a new lounge, a new week, a new someone.`
}

function shareText(impact: Impact): string {
  return `I passed on ${impact.rehomed} things and kept about ${formatKg(impact.kg)} kg in use with looped. Clearing a home can be a gentle thing.`
}
