import type { Item, PlanFact } from "./types"

async function postJson<T>(url: string, init: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { method: "POST", ...init })
  } catch {
    throw new Error(
      "Couldn't reach the app's server. Is npm run dev still running?"
    )
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.error ?? `The server answered ${response.status}.`)
  }
  return body as T
}

export async function analyseVideo(file: File): Promise<Item[]> {
  const { items } = await postJson<{ items: Item[] }>("/api/analyse", {
    headers: { "Content-Type": file.type || "video/mp4" },
    body: file,
  })
  return items
}

export async function writePlanSummary(
  facts: PlanFact[],
  signal: AbortSignal
): Promise<string> {
  const { summary } = await postJson<{ summary: string }>("/api/plan", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(facts),
    signal,
  })
  return summary
}
