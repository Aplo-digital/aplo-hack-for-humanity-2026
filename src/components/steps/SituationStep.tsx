import { useState } from "react"
import { ArrowRight, Check } from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"
import { DEADLINE_LABELS, SITUATION_LABELS } from "@/lib/labels"
import { DEADLINES, SITUATIONS, type ClearOut } from "@/lib/types"

export function SituationStep({
  initial,
  onDone,
}: {
  initial: ClearOut
  onDone: (answers: ClearOut) => void
}) {
  const [answers, setAnswers] = useState(initial)

  // Tapping the chosen option again clears it, so nothing here is compulsory.
  const toggle = <K extends keyof ClearOut>(key: K, value: ClearOut[K]) =>
    setAnswers((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }))

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>What's this clear-out for?</h1>
        <p className={TYPE.bodyRelaxed}>
          Pick what fits. You can skip anything.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="What's this clear-out for?"
        className="flex flex-col gap-2.5"
      >
        {SITUATIONS.map((situation) => {
          const chosen = answers.situation === situation
          return (
            <button
              key={situation}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => toggle("situation", situation)}
              className={cn(
                "flex min-h-14 items-center justify-between gap-3 rounded-2xl px-4 text-left text-base transition-colors active:scale-[0.99]",
                chosen
                  ? "bg-sage font-medium ring-2 ring-pine"
                  : "bg-card ring-1 ring-border"
              )}
            >
              {SITUATION_LABELS[situation]}
              {chosen && (
                <Check size={ICON.md} className="shrink-0 text-pine" />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2.5">
        <h2 id="deadline" className="text-base font-medium">
          When does the house need to be empty?
        </h2>
        <div
          role="radiogroup"
          aria-labelledby="deadline"
          className="flex flex-wrap gap-2"
        >
          {DEADLINES.map((deadline) => {
            const chosen = answers.deadline === deadline
            return (
              <button
                key={deadline}
                type="button"
                role="radio"
                aria-checked={chosen}
                onClick={() => toggle("deadline", deadline)}
                className={cn(
                  "h-11 rounded-full px-4 text-base transition-colors",
                  chosen
                    ? "bg-primary font-medium text-primary-foreground"
                    : "bg-card ring-1 ring-border"
                )}
              >
                {DEADLINE_LABELS[deadline]}
              </button>
            )
          })}
        </div>
      </div>

      <ActionBar>
        <Button size="lg" className="w-full" onClick={() => onDone(answers)}>
          Choose a room
          <ArrowRight size={ICON.md} />
        </Button>
        <p className={`${TYPE.caption} text-center`}>
          You can change this later.
        </p>
      </ActionBar>
    </div>
  )
}
