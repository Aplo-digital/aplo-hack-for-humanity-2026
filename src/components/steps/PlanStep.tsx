import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ArrowLeft,
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
import { CATEGORY_LABELS } from "@/lib/labels"
import { destinationTitle, groupKey, planFacts, routeItems } from "@/lib/route"
import type { Item, PlanGroup } from "@/lib/types"

type Summary =
  | { status: "loading" }
  | { status: "done"; text: string }
  | { status: "failed" }

export function PlanStep({
  items,
  onEdit,
  onStartAgain,
}: {
  items: Item[]
  onEdit: () => void
  onStartAgain: () => void
}) {
  const plan = useMemo(() => routeItems(items, CHARITY_RULES), [items])
  const [summary, setSummary] = useState<Summary>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    writePlanSummary(planFacts(plan), controller.signal)
      .then((text) => setSummary({ status: "done", text }))
      .catch(() => {
        if (!controller.signal.aborted) setSummary({ status: "failed" })
      })
    return () => controller.abort()
  }, [plan, attempt])

  function retrySummary() {
    setSummary({ status: "loading" })
    setAttempt((n) => n + 1)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className={TYPE.pageTitle}>Find a home</h1>

      <section className="flex flex-col gap-3 rounded-2xl bg-peach p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={ICON.sm} className="text-terracotta" />
          <h2 className={TYPE.panelTitle}>Gemma's summary</h2>
        </div>
        <SummaryBody summary={summary} onRetry={retrySummary} />
      </section>

      <div className="flex items-start gap-2.5 px-1">
        <Info
          size={ICON.md}
          className="mt-0.5 shrink-0 text-muted-foreground"
        />
        <p className={TYPE.body}>
          Check with the store before you drop off. Rules change and vary from
          store to store.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {plan.map((group) => (
          <li key={groupKey(group.destination)}>
            <DestinationCard group={group} />
          </li>
        ))}
      </ul>

      <ActionBar>
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={onEdit}
          >
            <ArrowLeft size={ICON.md} />
            Edit my list
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="flex-1"
            onClick={onStartAgain}
          >
            <RotateCcw size={ICON.md} />
            Start again
          </Button>
        </div>
      </ActionBar>
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
          <span className="sr-only">Gemma is writing your summary</span>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )
    case "done":
      return <p className="text-sm leading-relaxed">{summary.text}</p>
    case "failed":
      return (
        <div className="flex flex-wrap items-center gap-3" role="alert">
          <p className={TYPE.body}>
            Gemma couldn't write a summary just now. Your plan is below.
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
    card: "bg-peach",
    badge: "bg-card",
    icon: <Recycle size={ICON.md} className="text-pine" />,
  },
  ask: {
    card: "border-2 border-dashed border-input",
    badge: "bg-sage",
    icon: <Store size={ICON.md} className="text-pine" />,
  },
} as const

function DestinationCard({ group }: { group: PlanGroup }) {
  const { destination, items } = group
  const style = DESTINATION_STYLE[destination.kind]

  return (
    <article className={cn("flex flex-col gap-4 rounded-2xl p-4", style.card)}>
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
            <h2 className={TYPE.cardTitle}>{destinationTitle(destination)}</h2>
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
              "rounded-full px-3 py-1 text-xs",
              destination.kind === "recycle" ? "bg-card" : "bg-sage"
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
          className="inline-flex items-center gap-1 self-start text-sm font-medium text-pine underline-offset-4 hover:underline"
        >
          Their donation guide
          <ExternalLink size={ICON.xs} />
        </a>
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
