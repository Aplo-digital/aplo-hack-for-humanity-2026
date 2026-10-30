import { CircleAlert, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ICON, IconBox, TYPE } from "@/components/design-system"

export function ErrorStep({
  message,
  onTryAgain,
}: {
  message: string
  onTryAgain: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4" role="alert">
        <IconBox variant="legend" accent="orange">
          <CircleAlert />
        </IconBox>
        <div className="flex flex-col gap-1">
          <h1 className={TYPE.sectionTitle}>Something went wrong</h1>
          <p className={TYPE.bodyRelaxed}>{message}</p>
        </div>
        <Button onClick={onTryAgain}>
          <RotateCcw size={ICON.md} />
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}
