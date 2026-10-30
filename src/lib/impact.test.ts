import { describe, expect, it } from "vitest"
import { impactOf } from "./impact"
import type { CharityRule, Item } from "./types"

const rules: CharityRule[] = [
  {
    charity: "Vinnies SA",
    category: "furniture",
    accepted: "yes",
    notes: "",
    source: "",
  },
  {
    charity: "Salvos Stores",
    category: "clothing",
    accepted: "yes",
    notes: "",
    source: "",
  },
]

const item = (overrides: Partial<Item>): Item => ({
  id: crypto.randomUUID(),
  name: "Thing",
  category: "other",
  quantity: 1,
  condition: "good",
  giveAway: true,
  ...overrides,
})

describe("impactOf", () => {
  it("adds typical weights by quantity and splits rehomed from recycled", () => {
    const impact = impactOf(
      [
        item({ name: "Armchair", category: "furniture" }),
        item({ name: "Shirt", category: "clothing", quantity: 4 }),
        item({ name: "Kettle", category: "electronics", condition: "broken" }),
        item({ name: "Old lamp", giveAway: false }),
      ],
      rules
    )
    expect(impact.things).toBe(6)
    expect(impact.rehomed).toBe(5)
    expect(impact.kg).toBe(26) // 20 + 4 × 0.5 + 4
    expect(impact.co2eKg).toBe(44) // (20 + 2) × 2
    expect(impact.households).toBe(2)
    expect(impact.biggest?.name).toBe("Armchair")
    expect(impact.byCategory.map((c) => c.category)).toEqual([
      "furniture",
      "clothing",
    ])
  })

  it("counts op shop items as rehomed", () => {
    const impact = impactOf([item({ category: "toys", quantity: 2 })], rules)
    expect(impact.rehomed).toBe(2)
    expect(impact.households).toBe(1)
    expect(impact.kg).toBe(1)
  })

  it("is empty for no items", () => {
    const impact = impactOf([], rules)
    expect(impact).toMatchObject({ things: 0, kg: 0, households: 0 })
    expect(impact.biggest).toBeNull()
  })
})
