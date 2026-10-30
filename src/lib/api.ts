import type { Item, PlanRequest } from "./types"
import { shrinkPhoto } from "./shrinkPhoto"
import { shrinkVideo } from "./shrinkVideo"

async function postJson<T>(url: string, init: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { method: "POST", ...init })
  } catch {
    throw new Error("We couldn't connect. Check your internet and try again.")
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      body.error ??
        `Something went wrong (error ${response.status}). Please try again.`
    )
  }
  return body as T
}

export async function analyseVideo(file: File): Promise<Item[]> {
  const video = await shrinkVideo(file)
  const { items } = await postJson<{ items: Item[] }>("/api/analyse", {
    headers: { "Content-Type": video.type || "video/mp4" },
    body: video,
  })
  return items
}

export async function analysePhotos(files: File[]): Promise<Item[]> {
  const photos = await Promise.all(files.map(shrinkPhoto))
  const { items } = await postJson<{ items: Item[] }>("/api/analyse-photos", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photos }),
  })
  return items
}

export async function writePlanSummary(
  request: PlanRequest,
  signal: AbortSignal
): Promise<string> {
  const { summary } = await postJson<{ summary: string }>("/api/plan", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  })
  return summary
}
