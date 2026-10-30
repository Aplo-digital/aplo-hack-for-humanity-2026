import { useEffect, useMemo, useRef, useState, type DragEvent } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Images,
  Lock,
  Upload,
  Video,
  X,
} from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"
import { MAX_PHOTOS } from "@/lib/types"

const CORNERS = [
  "top-6 left-6 border-t-2 border-l-2",
  "top-6 right-6 border-t-2 border-r-2",
  "bottom-6 left-6 border-b-2 border-l-2",
  "right-6 bottom-6 border-r-2 border-b-2",
]

type Mode = "video" | "photos"

export function UploadStep({
  roomName,
  onVideo,
  onPhotos,
  onBack,
}: {
  roomName: string
  onVideo: (file: File) => void
  onPhotos: (files: File[]) => void
  onBack: () => void
}) {
  const room = roomName.toLowerCase()
  const chooseInput = useRef<HTMLInputElement>(null)
  const recordInput = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<Mode>("video")
  const [photos, setPhotos] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [hint, setHint] = useState("")

  const previews = useMemo(
    () => photos.map((photo) => URL.createObjectURL(photo)),
    [photos]
  )
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews]
  )

  function pick(files: File[]) {
    if (files.length === 0) return
    setHint("")
    if (mode === "video") {
      if (!files[0].type.startsWith("video/")) {
        setHint("That isn't a video. Please choose a video file.")
        return
      }
      onVideo(files[0])
      return
    }
    const images = files.filter((file) => file.type.startsWith("image/"))
    if (images.length < files.length)
      setHint("We skipped files that aren't photos.")
    const space = MAX_PHOTOS - photos.length
    if (images.length > space) {
      setHint(`You can add up to ${MAX_PHOTOS} photos for one room.`)
    }
    setPhotos((current) => [...current, ...images.slice(0, space)])
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    pick([...event.dataTransfer.files])
  }

  function switchMode(next: Mode) {
    setMode(next)
    setHint("")
  }

  const accept = mode === "video" ? "video/*" : "image/*"
  const full = photos.length >= MAX_PHOTOS

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>
          {mode === "video" ? `Film the ${room}` : `Photograph the ${room}`}
        </h1>
        <p className={TYPE.bodyRelaxed}>
          {mode === "video"
            ? "Walk slowly around the room and open cupboards as you go."
            : "Take a few photos from different corners so everything is in at least one."}{" "}
          Gemma lists what it sees, and you tick what you're giving away.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Video or photos"
        className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1"
      >
        {(
          [
            ["video", "Video", Video],
            ["photos", "Photos", Images],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            onClick={() => switchMode(value)}
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-full text-sm transition-colors",
              mode === value
                ? "bg-card font-medium shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <Icon size={ICON.sm} />
            {label}
          </button>
        ))}
      </div>

      {mode === "photos" && photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {previews.map((url, index) => (
            <li key={url} className="relative aspect-square">
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="size-full rounded-xl object-cover"
              />
              <button
                type="button"
                aria-label={`Remove photo ${index + 1}`}
                onClick={() =>
                  setPhotos((current) => current.filter((_, i) => i !== index))
                }
                className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-card/90 text-foreground"
              >
                <X size={ICON.sm} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
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
            {mode === "video"
              ? `Add a video of the ${room}`
              : `Add photos of the ${room}`}
          </span>
          <span className="text-xs text-foreground/70">
            {mode === "video"
              ? "Drop it here, or use a button below. Up to about 2 minutes."
              : `Drop them here, or use a button below. Up to ${MAX_PHOTOS} photos.`}
          </span>
        </div>
      )}

      {hint && (
        <p role="alert" className="text-sm text-destructive">
          {hint}
        </p>
      )}

      <input
        ref={chooseInput}
        type="file"
        accept={accept}
        multiple={mode === "photos"}
        className="sr-only"
        tabIndex={-1}
        aria-label={mode === "video" ? "Choose a video" : "Choose photos"}
        onChange={(event) => {
          pick([...(event.target.files ?? [])])
          event.target.value = ""
        }}
      />
      <input
        ref={recordInput}
        type="file"
        accept={accept}
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-label={mode === "video" ? "Record a video" : "Take a photo"}
        onChange={(event) => {
          pick([...(event.target.files ?? [])])
          event.target.value = ""
        }}
      />

      <ActionBar>
        {mode === "photos" && photos.length > 0 && (
          <Button size="lg" className="w-full" onClick={() => onPhotos(photos)}>
            Look at {photos.length} {photos.length === 1 ? "photo" : "photos"}
            <ArrowRight size={ICON.md} />
          </Button>
        )}
        <div className={cn("flex gap-2", mode === "video" && "flex-col")}>
          <Button
            size="lg"
            variant={mode === "video" ? "default" : "outline"}
            className={mode === "video" ? "w-full" : "flex-1"}
            disabled={full}
            onClick={() => chooseInput.current?.click()}
          >
            <Upload size={ICON.md} />
            {mode === "video" ? "Choose a video" : "Choose photos"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className={mode === "video" ? "w-full" : "flex-1"}
            disabled={full}
            onClick={() => recordInput.current?.click()}
          >
            <Camera size={ICON.md} />
            {mode === "video" ? "Record one now" : "Take a photo"}
          </Button>
        </div>
        <Button variant="ghost" className="w-full" onClick={onBack}>
          <ArrowLeft size={ICON.md} />
          Back to rooms
        </Button>
        <p
          className={`${TYPE.caption} flex items-start justify-center gap-1.5 text-center`}
        >
          <Lock size={ICON.xs} className="mt-0.5 shrink-0" />
          Your {mode === "video" ? "video is" : "photos are"} sent to Google's
          Gemini API to find the items. We don't save{" "}
          {mode === "video" ? "it" : "them"}.
        </p>
      </ActionBar>
    </div>
  )
}
