import { useRef, useState, type DragEvent } from "react"
import { Camera, Lock, Upload } from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"

const CORNERS = [
  "top-6 left-6 border-t-2 border-l-2",
  "top-6 right-6 border-t-2 border-r-2",
  "bottom-6 left-6 border-b-2 border-l-2",
  "right-6 bottom-6 border-r-2 border-b-2",
]

export function UploadStep({ onVideo }: { onVideo: (file: File) => void }) {
  const chooseInput = useRef<HTMLInputElement>(null)
  const recordInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [hint, setHint] = useState("")

  function pick(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("video/")) {
      setHint("That isn't a video. Please choose a video file.")
      return
    }
    onVideo(file)
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    pick(event.dataTransfer.files[0])
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>Moving out? Pass it on.</h1>
        <p className={TYPE.bodyRelaxed}>
          Film a slow walk around a room. Gemma lists what it sees, you tick
          what you're giving away, and we tell you which charity takes each
          thing.
        </p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex h-[min(36dvh,340px)] min-h-52 flex-col items-center justify-center gap-2 rounded-2xl bg-taupe px-6 text-center transition-colors",
          dragging && "bg-sage ring-2 ring-primary"
        )}
      >
        {CORNERS.map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={`absolute size-6 border-card/90 ${corner}`}
          />
        ))}
        <span className="rounded-full bg-card/85 px-4 py-1.5 text-sm text-foreground">
          Add a video of your room
        </span>
        <span className="text-xs text-foreground/70">
          Drop it here, or use a button below. Up to 200 MB.
        </span>
      </div>

      {hint && (
        <p role="alert" className="text-sm text-destructive">
          {hint}
        </p>
      )}

      <input
        ref={chooseInput}
        type="file"
        accept="video/*"
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose a video"
        onChange={(event) => pick(event.target.files?.[0])}
      />
      <input
        ref={recordInput}
        type="file"
        accept="video/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-label="Record a video"
        onChange={(event) => pick(event.target.files?.[0])}
      />

      <ActionBar>
        <Button
          size="lg"
          className="w-full"
          onClick={() => chooseInput.current?.click()}
        >
          <Upload size={ICON.md} />
          Choose a video
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => recordInput.current?.click()}
        >
          <Camera size={ICON.md} />
          Record one now
        </Button>
        <p
          className={`${TYPE.caption} flex items-start justify-center gap-1.5 text-center`}
        >
          <Lock size={ICON.xs} className="mt-0.5 shrink-0" />
          Your video is sent to Google's Gemini API to find the items. We don't
          save it.
        </p>
      </ActionBar>
    </div>
  )
}
