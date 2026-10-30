// Netlify Functions accept about 4.5 MB of video, and phone videos are 30 to 100 MB.
// Re-recording at 480p and 300 kbps, sped up to at most ~20 s, gives 400 to 700 KB.
// Gemma still found the same items in a 20 s sped-up WebM, in 15 to 42 s.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

const TARGET_HEIGHT = 480
const TARGET_SECONDS = 20
const MAX_PLAYBACK_RATE = 16
const BITS_PER_SECOND = 300_000

function pickMimeType(): string | undefined {
  return ["video/webm;codecs=vp8", "video/webm", "video/mp4"].find((type) =>
    MediaRecorder.isTypeSupported(type)
  )
}

function loadVideo(file: File): Promise<HTMLVideoElement> {
  const video = document.createElement("video")
  video.muted = true
  video.playsInline = true
  video.preload = "auto"
  video.src = URL.createObjectURL(file)
  return new Promise((resolve, reject) => {
    video.onloadeddata = () => resolve(video)
    video.onerror = () =>
      reject(new Error("We couldn't read that video. Try another one, or record it again."))
  })
}

export async function shrinkVideo(file: File): Promise<Blob> {
  const mimeType = typeof MediaRecorder === "undefined" ? undefined : pickMimeType()
  if (!mimeType) {
    if (file.size <= MAX_UPLOAD_BYTES) return file
    throw new Error("This browser can't shrink videos. Try Chrome, or a clip under 4 MB.")
  }

  const video = await loadVideo(file)
  try {
    const scale = Math.min(1, TARGET_HEIGHT / video.videoHeight)
    const canvas = document.createElement("canvas")
    canvas.width = Math.round((video.videoWidth * scale) / 2) * 2
    canvas.height = Math.round((video.videoHeight * scale) / 2) * 2
    const context = canvas.getContext("2d")
    if (!context) throw new Error("This browser can't shrink videos. Try Chrome.")

    const recorder = new MediaRecorder(canvas.captureStream(15), {
      mimeType,
      videoBitsPerSecond: BITS_PER_SECOND,
    })
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => chunks.push(event.data)
    const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()))

    let drawing = true
    const draw = () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      if (drawing) requestAnimationFrame(draw)
    }

    video.playbackRate = Math.min(
      MAX_PLAYBACK_RATE,
      Math.max(1, video.duration / TARGET_SECONDS)
    )
    recorder.start(1000)
    draw()
    await video.play()
    await new Promise<void>((resolve, reject) => {
      video.onended = () => resolve()
      video.onerror = () => reject(new Error("The video stopped playing part way through."))
    })
    drawing = false
    recorder.stop()
    await stopped

    const small = new Blob(chunks, { type: mimeType.split(";")[0] })
    if (small.size > MAX_UPLOAD_BYTES) {
      throw new Error("That video is too long to send. Try a clip under 2 minutes.")
    }
    return small
  } finally {
    URL.revokeObjectURL(video.src)
  }
}
