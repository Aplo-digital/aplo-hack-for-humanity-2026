import { useEffect, useMemo, useRef, useState, type DragEvent } from "react"
import { ArrowRight, Camera, Lock, Plus, Upload, X } from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"
import { MAX_PHOTOS } from "@/lib/types"

const CORNERS = [
  "top-5 left-5 border-t-2 border-l-2",
  "top-5 right-5 border-t-2 border-r-2",
  "bottom-5 left-5 border-b-2 border-l-2",
  "right-5 bottom-5 border-r-2 border-b-2",
]

export function UploadStep({
  roomName,
  onPhotos,
}: {
  roomName: string
  onPhotos: (files: File[]) => void
}) {
  const room = roomName.toLowerCase()
  const chooseInput = useRef<HTMLInputElement>(null)
  const cameraInput = useRef<HTMLInputElement>(null)
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
    const images = files.filter((file) => file.type.startsWith("image/"))
    if (images.length < files.length)
      setHint("We skipped files that aren't photos.")
    const space = MAX_PHOTOS - photos.length
    if (images.length > space) {
      setHint(`You can add up to ${MAX_PHOTOS} photos for each room.`)
    }
    setPhotos((current) => [...current, ...images.slice(0, space)])
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    pick([...event.dataTransfer.files])
  }

  const full = photos.length >= MAX_PHOTOS

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>Take photos of the {room}</h1>
        <p className={TYPE.bodyRelaxed}>
          Take photos from each corner. Make sure everything is in at least one
          photo.
        </p>
        <p className={TYPE.bodyRelaxed}>
          We'll make a list of your things. Then you remove anything you're
          keeping.
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
          "flex flex-col gap-4 rounded-2xl bg-black p-5 text-white ring-1 ring-white/10",
          dragging && "ring-2 ring-white"
        )}
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg text-white">
            Add photos of the {room}
          </h2>
          <p className="text-base leading-snug text-white/90">
            {photos.length > 0
              ? `${photos.length} of ${MAX_PHOTOS}. Swipe sideways to see them.`
              : `Drag them here, or use a button below. Up to ${MAX_PHOTOS} photos.`}
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="relative flex h-[min(30dvh,280px)] min-h-44 items-center justify-center">
            {CORNERS.map((corner) => (
              <span
                key={corner}
                aria-hidden
                className={`absolute size-6 border-white/80 ${corner}`}
              />
            ))}
            <Camera
              size={ICON.xl}
              strokeWidth={1.5}
              className="text-white/70"
              aria-hidden
            />
          </div>
        ) : (
          <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
            {previews.map((url, index) => (
              <li
                key={url}
                className="relative aspect-[3/4] w-32 shrink-0 snap-start"
              >
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="size-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() =>
                    setPhotos((current) =>
                      current.filter((_, i) => i !== index)
                    )
                  }
                  className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/70 text-white"
                >
                  <X size={ICON.sm} />
                </button>
              </li>
            ))}
            {!full && (
              <li className="aspect-[3/4] w-32 shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => chooseInput.current?.click()}
                  className="flex size-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/70 text-base text-white hover:bg-white/10"
                >
                  <Plus size={ICON.lg} aria-hidden />
                  Add new photo
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {hint && (
        <p role="alert" className="text-base text-destructive">
          {hint}
        </p>
      )}

      <input
        ref={chooseInput}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose photos"
        onChange={(event) => {
          pick([...(event.target.files ?? [])])
          event.target.value = ""
        }}
      />
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-label="Take a photo"
        onChange={(event) => {
          pick([...(event.target.files ?? [])])
          event.target.value = ""
        }}
      />

      <ActionBar>
        {photos.length > 0 && (
          <Button size="lg" className="w-full" onClick={() => onPhotos(photos)}>
            Find things in {photos.length}{" "}
            {photos.length === 1 ? "photo" : "photos"}
            <ArrowRight size={ICON.md} />
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            size="lg"
            variant={photos.length === 0 ? "default" : "outline"}
            className="flex-1"
            disabled={full}
            onClick={() => cameraInput.current?.click()}
          >
            <Camera size={ICON.md} />
            Take a photo
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            disabled={full}
            onClick={() => chooseInput.current?.click()}
          >
            <Upload size={ICON.md} />
            Choose photos
          </Button>
        </div>
        <p
          className={`${TYPE.caption} flex items-start justify-center gap-1.5 text-center`}
        >
          <Lock size={ICON.xs} className="mt-0.5 shrink-0" />
          To find your things, we send your photos to Google's AI. We don't keep
          them.
        </p>
      </ActionBar>
    </div>
  )
}
