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

/** Most photos Gemma looks at in one go, for one room. */
export const MAX_PHOTOS = 10

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

export const SITUATIONS = [
  "loved_one",
  "aged_care",
  "downsizing",
  "moving_in",
  "separation",
] as const
export type Situation = (typeof SITUATIONS)[number]

export const DEADLINES = ["weekend", "two_weeks", "month", "no_rush"] as const
export type Deadline = (typeof DEADLINES)[number]

/** What the person told us on the clear-out screen. Both are optional. */
export type ClearOut = { situation?: Situation; deadline?: Deadline }

/** A room in the home. `items` is null until it has been photographed. */
export type Room = { id: string; name: string; items: Item[] | null }

export type AppState =
  | { step: "welcome" }
  | { step: "situation" }
  | { step: "rooms" }
  | { step: "upload"; roomId: string }
  | { step: "analysing"; roomId: string; source: string }
  | { step: "review"; roomId: string; items: Item[] }
  | { step: "plan" }
  | { step: "impact" }
  | { step: "error"; roomId: string; message: string }

/** What the browser sends to /api/plan. */
export type PlanRequest = { facts: PlanFact[] } & ClearOut

/** The plan as plain facts for Gemma. */
export type PlanFact = {
  destination: string
  notes: string
  items: { name: string; quantity: number }[]
}
