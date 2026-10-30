import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/Skeleton"
import { TYPE } from "@/components/design-system"

export function AnalysingStep({ fileName }: { fileName: string }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>Looking at your video</h1>
        <p className={TYPE.bodyRelaxed} role="status">
          Gemma is watching your video… usually 15–40 seconds.
        </p>
        <p className={`${TYPE.caption} truncate`}>{fileName}</p>
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((row) => (
          <Card key={row} size="sm">
            <CardContent className="flex items-center gap-3">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
