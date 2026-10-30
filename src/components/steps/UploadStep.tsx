import { useRef, useState, type DragEvent } from "react"
import { Camera, Lock, Upload, Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ICON, IconBox, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>Moving out? Pass it on.</h1>
        <p className={TYPE.bodyRelaxed}>
          Film a slow walk around a room. Gemma lists what it sees, you tick
          what you're giving away, and we tell you which charity takes each
          thing.
        </p>
      </div>

      <Card>
        <CardContent>
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center gap-4 rounded-lg border border-dashed px-4 py-10 text-center transition-colors",
              dragging && "border-ring bg-muted"
            )}
          >
            <IconBox variant="hero" accent="emerald">
              <Video />
            </IconBox>
            <div className="flex flex-col gap-1">
              <p className={TYPE.cardTitle}>Add a video of your room</p>
              <p className={TYPE.caption}>
                Drop it here, or use a button below. Up to 200 MB.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="lg" onClick={() => chooseInput.current?.click()}>
                <Upload size={ICON.md} />
                Choose a video
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => recordInput.current?.click()}
              >
                <Camera size={ICON.md} />
                Record one now
              </Button>
            </div>
            {hint && (
              <p role="alert" className="text-sm text-destructive">
                {hint}
              </p>
            )}
          </div>
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
        </CardContent>
      </Card>

      <div className="flex items-start gap-2.5">
        <Lock
          size={ICON.sm}
          className="mt-0.5 shrink-0 text-muted-foreground"
        />
        <p className={TYPE.body}>
          Your video is sent to Google's Gemini API to find the items. We don't
          save it.
        </p>
      </div>
    </div>
  )
}
