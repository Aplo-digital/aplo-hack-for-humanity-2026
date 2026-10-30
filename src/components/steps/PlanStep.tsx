import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import {
  Check,
  ExternalLink,
  Heart,
  Info,
  Recycle,
  RotateCcw,
  Sparkles,
  Store,
} from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/Skeleton"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"
import { writePlanSummary } from "@/lib/api"
import { CHARITY_RULES } from "@/lib/charities"
import { donatedCount, groupKey } from "@/lib/donations"
import { CATEGORY_LABELS } from "@/lib/labels"
import { destinationTitle, planFacts, routeItems } from "@/lib/route"
import type { ClearOut, Item, PlanGroup } from "@/lib/types"

const PlanMap = lazy(() => import("@/components/PlanMap"))

type Summary =
  | { status: "loading" }
  | { status: "done"; text: string }
  | { status: "failed" }

const VIEWS = [
  { id: "list", label: "List view" },
  { id: "map", label: "Map view" },
] as const
type View = (typeof VIEWS)[number]["id"]

export function PlanStep({
  items,
  clearOut,
  donated,
  onToggleDonated,
  onAllDonated,
  onStartAgain,
}: {
  items: Item[]
  clearOut: ClearOut
  donated: string[]
  onToggleDonated: (key: string) => void
  onAllDonated: () => void
  onStartAgain: () => void
}) {
  const plan = useMemo(() => routeItems(items, CHARITY_RULES), [items])
  const [view, setView] = useState<View>("list")
  const [summary, setSummary] = useState<Summary>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)
  const done = donatedCount(plan, donated)
  const allDone = plan.length > 0 && done === plan.length

  useEffect(() => {
    const controller = new AbortController()
    writePlanSummary({ facts: planFacts(plan), ...clearOut }, controller.signal)
      .then((text) => setSummary({ status: "done", text }))
      .catch(() => {
        if (!controller.signal.aborted) setSummary({ status: "failed" })
      })
    return () => controller.abort()
  }, [plan, clearOut, attempt])

  function retrySummary() {
    setSummary({ status: "loading" })
    setAttempt((n) => n + 1)
  }

  function toggle(key: string) {
    const marking = !donated.includes(key)
    onToggleDonated(key)
    if (marking && donatedCount(plan, [...donated, key]) === plan.length) {
      onAllDonated()
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className={TYPE.pageTitle}>Find a home</h1>

      <ViewTabs view={view} onChange={setView} />

      {view === "map" ? (
        <div id="plan-panel-map" role="tabpanel" aria-labelledby="plan-tab-map">
          <Suspense
            fallback={
              <div
                className="h-[60vh] rounded-2xl bg-sage"
                aria-busy="true"
                aria-label="Loading the map"
              />
            }
          >
            <PlanMap plan={plan} />
          </Suspense>
        </div>
      ) : (
        <div
          id="plan-panel-list"
          role="tabpanel"
          aria-labelledby="plan-tab-list"
          className="flex flex-col gap-6"
        >
          <section className="flex flex-col gap-3 rounded-2xl bg-sage p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={ICON.sm} className="text-pine" />
              <h2 className={TYPE.panelTitle}>Your plan in short</h2>
            </div>
            <SummaryBody summary={summary} onRetry={retrySummary} />
          </section>

          <div className="flex items-start gap-2.5 px-1">
            <Info
              size={ICON.md}
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
            <p className={TYPE.body}>
              Call or check the website before you drop things off. Each store
              has its own rules, and they can change.
            </p>
          </div>

          {plan.length > 0 && (
            <DonatedProgress done={done} total={plan.length} />
          )}

          <ul className="flex flex-col gap-3">
            {plan.map((group) => {
              const key = groupKey(group)
              return (
                <li key={key}>
                  <DestinationCard
                    group={group}
                    donated={donated.includes(key)}
                    onToggleDonated={() => toggle(key)}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <ActionBar>
        {allDone && (
          <Button size="lg" className="w-full" onClick={onAllDonated}>
            <Heart size={ICON.md} />
            See what this adds up to
          </Button>
        )}
        <Button
          size="lg"
          variant="ghost"
          className="w-full"
          onClick={onStartAgain}
        >
          <RotateCcw size={ICON.md} />
          Start again
        </Button>
      </ActionBar>
    </div>
  )
}

function ViewTabs({
  view,
  onChange,
}: {
  view: View
  onChange: (view: View) => void
}) {
  const tabs = useRef<Partial<Record<View, HTMLButtonElement | null>>>({})

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    const index = VIEWS.findIndex((option) => option.id === view)
    const next = VIEWS[(index + 1) % VIEWS.length].id
    onChange(next)
    tabs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="List or map"
      className="grid grid-cols-2 gap-1 rounded-full bg-sage p-1"
      onKeyDown={onKeyDown}
    >
      {VIEWS.map((option) => {
        const selected = option.id === view
        return (
          <button
            key={option.id}
            ref={(element) => {
              tabs.current[option.id] = element
            }}
            id={`plan-tab-${option.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`plan-panel-${option.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.id)}
            className={cn(
              "h-11 rounded-full text-base font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "bg-card text-pine shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function DonatedProgress({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex flex-col gap-2 px-1">
      <p className={TYPE.panelTitle} aria-live="polite">
        {done} of {total} marked as donated
      </p>
      <div
        className="h-2 overflow-hidden rounded-full bg-sage"
        role="progressbar"
        aria-label="Marked as donated"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div
          className="h-full rounded-full bg-pine transition-[width] duration-500 ease-in-out"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

function SummaryBody({
  summary,
  onRetry,
}: {
  summary: Summary
  onRetry: () => void
}) {
  switch (summary.status) {
    case "loading":
      return (
        <div className="flex flex-col gap-2" aria-busy="true">
          <span className="sr-only">Writing your summary</span>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )
    case "done":
      return <p className="text-base leading-relaxed">{summary.text}</p>
    case "failed":
      return (
        <div className="flex flex-wrap items-center gap-3" role="alert">
          <p className={TYPE.body}>
            We couldn't write a summary just now. Your full plan is below.
          </p>
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RotateCcw size={ICON.sm} />
            Try again
          </Button>
        </div>
      )
  }
}

const DESTINATION_STYLE = {
  charity: {
    card: "bg-card ring-1 ring-border",
    badge: "bg-sage",
    icon: <Heart size={ICON.md} className="fill-terracotta text-terracotta" />,
  },
  recycle: {
    card: "bg-sage",
    badge: "bg-card",
    icon: <Recycle size={ICON.md} className="text-pine" />,
  },
  ask: {
    card: "border-2 border-dashed border-input",
    badge: "bg-sage",
    icon: <Store size={ICON.md} className="text-pine" />,
  },
} as const

function DestinationCard({
  group,
  donated,
  onToggleDonated,
}: {
  group: PlanGroup
  donated: boolean
  onToggleDonated: () => void
}) {
  const { destination, items } = group
  const style = DESTINATION_STYLE[destination.kind]
  const title = destinationTitle(destination)

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl p-4 transition-colors duration-500",
        donated ? "bg-sage" : style.card
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            style.badge
          )}
        >
          {style.icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={TYPE.cardTitle}>{title}</h2>
            {destination.kind === "charity" && (
              <Badge variant="secondary" className={TYPE.badge}>
                {CATEGORY_LABELS[destination.rule.category]}
              </Badge>
            )}
          </div>
          <p className={TYPE.caption}>
            <WithLinks
              text={
                destination.kind === "charity"
                  ? destination.rule.notes
                  : destination.reason
              }
            />
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "rounded-full px-3 py-1.5 text-base",
              donated || destination.kind !== "charity" ? "bg-card" : "bg-sage"
            )}
          >
            <span className="tabular-nums">{item.quantity} ×</span> {item.name}
          </li>
        ))}
      </ul>

      {destination.kind === "charity" && destination.rule.source && (
        <a
          href={destination.rule.source}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 self-start text-base font-medium text-pine underline-offset-4 hover:underline"
        >
          See what they take
          <ExternalLink size={ICON.xs} />
        </a>
      )}

      {donated ? (
        <div className="flex items-center justify-between gap-3 border-t border-pine/15 pt-3">
          <span className="inline-flex items-center gap-2 text-base font-medium text-pine">
            <span className="flex size-6 items-center justify-center rounded-full bg-pine text-primary-foreground">
              <Check size={ICON.sm} />
            </span>
            Donated
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleDonated}
            aria-label={`Undo donated for ${title}`}
          >
            Undo
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="h-10 self-start border border-dashed border-pine/40 px-4 text-pine"
          onClick={onToggleDonated}
        >
          <Check size={ICON.md} />
          Mark as donated
        </Button>
      )}
    </article>
  )
}

function WithLinks({ text }: { text: string }): ReactNode {
  return text.split(/(https?:\/\/\S+)/).map((part, index) =>
    index % 2 === 1 ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-foreground underline underline-offset-4"
      >
        {part.replace(/^https?:\/\//, "").replace(/\/$/, "")}
      </a>
    ) : (
      part
    )
  )
}
