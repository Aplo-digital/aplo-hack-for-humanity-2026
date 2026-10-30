import { CircleAlert, RotateCcw } from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { ICON, TYPE } from "@/components/design-system"

export function ErrorStep({
  message,
  onTryAgain,
}: {
  message: string
  onTryAgain: () => void
}) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div
        className="flex flex-col items-start gap-4 rounded-2xl bg-peach p-5"
        role="alert"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-card text-terracotta">
          <CircleAlert size={ICON.xl} />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className={TYPE.sectionTitle}>Something went wrong</h1>
          <p className={TYPE.bodyRelaxed}>{message}</p>
        </div>
      </div>
      <ActionBar>
        <Button size="lg" className="w-full" onClick={onTryAgain}>
          <RotateCcw size={ICON.md} />
          Try again
        </Button>
      </ActionBar>
    </div>
  )
}
