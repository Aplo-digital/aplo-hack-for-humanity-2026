import { CHARITY_RULES } from "./charities"
import { routeItems } from "./route"
import type { Category, CharityRule, Item } from "./types"

// Rough assumptions, not measurements: a typical weight in kg for one thing in each category.
// CO2E_KG_PER_KG_REUSED is an equally rough average for emissions avoided by reuse.
export const TYPICAL_KG: Record<Category, number> = {
  furniture: 20,
  clothing: 0.5,
  electronics: 4,
  kitchenware: 0.8,
  books_media: 0.4,
  decor: 1,
  linen: 1,
  toys: 0.5,
  other: 1.5,
}

export const CO2E_KG_PER_KG_REUSED = 2

export type CategoryImpact = { category: Category; count: number; kg: number }

export type Impact = {
  /** Every thing given away, counting quantity. */
  things: number
  /** Things going to a charity or op shop rather than recycling. */
  rehomed: number
  /** Kept out of landfill: rehomed plus recycled. */
  kg: number
  co2eKg: number
  /** One per charity or op shop destination. */
  households: number
  /** Rehomed things per category, heaviest first. */
  byCategory: CategoryImpact[]
  /** The heaviest single thing being rehomed, for a friendly line. */
  biggest: Item | null
}

const weightOf = (item: Item) => item.quantity * TYPICAL_KG[item.category]
const sum = (values: number[]) => values.reduce((total, n) => total + n, 0)
const round1 = (n: number) => Math.round(n * 10) / 10

export function impactOf(
  items: Item[],
  rules: CharityRule[] = CHARITY_RULES
): Impact {
  const plan = routeItems(items, rules)
  const given = plan.flatMap((group) => group.items)
  const rehomedGroups = plan.filter(
    (group) => group.destination.kind !== "recycle"
  )
  const rehomedItems = rehomedGroups.flatMap((group) => group.items)

  const byCategory = new Map<Category, CategoryImpact>()
  for (const item of rehomedItems) {
    const entry = byCategory.get(item.category) ?? {
      category: item.category,
      count: 0,
      kg: 0,
    }
    entry.count += item.quantity
    entry.kg += weightOf(item)
    byCategory.set(item.category, entry)
  }

  const biggest = rehomedItems.reduce<Item | null>(
    (best, item) =>
      !best || TYPICAL_KG[item.category] > TYPICAL_KG[best.category]
        ? item
        : best,
    null
  )

  return {
    things: sum(given.map((item) => item.quantity)),
    rehomed: sum(rehomedItems.map((item) => item.quantity)),
    kg: round1(sum(given.map(weightOf))),
    co2eKg: Math.round(sum(rehomedItems.map(weightOf)) * CO2E_KG_PER_KG_REUSED),
    households: rehomedGroups.length,
    byCategory: [...byCategory.values()]
      .map((entry) => ({ ...entry, kg: round1(entry.kg) }))
      .sort((a, b) => b.kg - a.kg),
    biggest,
  }
}
