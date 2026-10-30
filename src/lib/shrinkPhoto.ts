// Phone photos are 3 to 12 MB and Gemma took 84 to 97 s on one. Shrunk to 1024 px JPEG
// (about 75 KB), one or two photos took about 19 s with the same items found.
const MAX_EDGE = 1024
const QUALITY = 0.7

export type Photo = { mimeType: "image/jpeg"; data: string }

export async function shrinkPhoto(file: File): Promise<Photo> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
  } catch {
    throw new Error(
      `We couldn't open ${file.name}. Try a JPEG or PNG photo, or take it again in the app.`
    )
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY)
  return {
    mimeType: "image/jpeg",
    data: dataUrl.slice(dataUrl.indexOf(",") + 1),
  }
}
