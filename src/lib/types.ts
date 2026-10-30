export const CATEGORIES = [
  "furniture",
  "clothing",
  "electronics",
  "kitchenware",
  "books_media",
  "decor",
  "linen",
  "toys",
  "other",
] as const
export type Category = (typeof CATEGORIES)[number]

export const CONDITIONS = ["good", "worn", "broken", "unsure"] as const
export type Condition = (typeof CONDITIONS)[number]

export type Item = {
  id: string
  name: string
  category: Category
  quantity: number
  condition: Condition
  giveAway: boolean
}

export type CharityRule = {
  charity: string
  category: Category
  accepted: "yes" | "some"
  notes: string
  source: string
}

export type Destination =
  | { kind: "charity"; charity: string; rule: CharityRule }
  | { kind: "recycle"; reason: string }
  | { kind: "ask"; reason: string }

export type PlanGroup = { destination: Destination; items: Item[] }

export type AppState =
  | { step: "upload" }
  | { step: "analysing"; fileName: string }
  | { step: "review"; items: Item[] }
  | { step: "plan"; items: Item[] }
  | { step: "error"; message: string }

/** What the browser sends to /api/plan: the plan as plain facts for Gemma. */
export type PlanFact = {
  destination: string
  notes: string
  items: { name: string; quantity: number }[]
}
