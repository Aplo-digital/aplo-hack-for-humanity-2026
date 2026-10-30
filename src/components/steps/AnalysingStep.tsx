import { Skeleton } from "@/components/Skeleton"
import { TYPE } from "@/components/design-system"

export function AnalysingStep({
  roomName,
  source,
}: {
  roomName: string
  /** The video's file name, or "3 photos". */
  source: string
}) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>
          Looking at your {roomName.toLowerCase()}
        </h1>
        <p className={TYPE.bodyRelaxed} role="status">
          Shrinking it, then Gemma looks for your things… usually under a
          minute.
        </p>
        <p className={`${TYPE.caption} truncate`}>{source}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {["bg-sage", "bg-peach", "bg-peach", "bg-sage"].map((tone, index) => (
          <div
            key={index}
            className={`flex h-28 flex-col justify-end gap-2 rounded-2xl p-4 ${tone}`}
          >
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-3.5 w-3/4 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
