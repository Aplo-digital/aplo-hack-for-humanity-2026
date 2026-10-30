import { describe, expect, it } from "vitest"
import { parseCharityRules } from "./charities"
import { routeItems } from "./route"
import type { CharityRule, Item } from "./types"

const rules: CharityRule[] = [
  {
    charity: "Salvos Stores",
    category: "furniture",
    accepted: "some",
    notes: "Big stores",
    source: "s",
  },
  {
    charity: "Vinnies SA",
    category: "furniture",
    accepted: "yes",
    notes: "Good condition",
    source: "v",
  },
  {
    charity: "Salvos Stores",
    category: "clothing",
    accepted: "yes",
    notes: "Clean",
    source: "s",
  },
  {
    charity: "Vinnies SA",
    category: "clothing",
    accepted: "yes",
    notes: "No rips",
    source: "v",
  },
  {
    charity: "Salvos Stores",
    category: "electronics",
    accepted: "some",
    notes: "Small",
    source: "s",
  },
]

function item(id: string, patch: Partial<Item>): Item {
  return {
    id,
    name: id,
    category: "other",
    quantity: 1,
    condition: "good",
    giveAway: true,
    ...patch,
  }
}

describe("routeItems", () => {
  it("skips items the person is keeping", () => {
    expect(routeItems([item("lamp", { giveAway: false })], rules)).toEqual([])
  })

  it("sends broken electronics to e-waste and other broken things to hard rubbish", () => {
    const plan = routeItems(
      [
        item("tv", { category: "electronics", condition: "broken" }),
        item("chair", { category: "furniture", condition: "broken" }),
      ],
      rules
    )
    expect(plan.map((g) => g.destination.kind)).toEqual(["recycle", "recycle"])
    const [ewaste, hardRubbish] = plan.map((g) =>
      g.destination.kind === "recycle" ? g.destination.reason : ""
    )
    expect(ewaste).toContain("recyclingnearyou.com.au")
    expect(hardRubbish).toContain("hard rubbish")
  })

  it("prefers a charity that fully accepts the category over one that sometimes does", () => {
    const [group] = routeItems([item("sofa", { category: "furniture" })], rules)
    expect(group.destination).toMatchObject({
      kind: "charity",
      charity: "Vinnies SA",
    })
  })

  it("takes the first 'yes' rule in file order", () => {
    const [group] = routeItems(
      [item("jacket", { category: "clothing" })],
      rules
    )
    expect(group.destination).toMatchObject({
      kind: "charity",
      charity: "Salvos Stores",
    })
  })

  it("falls back to a 'some' rule", () => {
    const [group] = routeItems(
      [item("radio", { category: "electronics", condition: "worn" })],
      rules
    )
    expect(group.destination).toMatchObject({
      kind: "charity",
      charity: "Salvos Stores",
    })
  })

  it("says to ask the local op shop when no rule matches", () => {
    const [group] = routeItems([item("rug", { category: "linen" })], rules)
    expect(group.destination.kind).toBe("ask")
  })

  it("groups by charity and category, charities first, then recycling, then ask", () => {
    const plan = routeItems(
      [
        item("jacket", { category: "clothing" }),
        item("rug", { category: "linen" }),
        item("tv", { category: "electronics", condition: "broken" }),
        item("radio", { category: "electronics" }),
        item("shirt", { category: "clothing" }),
      ],
      rules
    )
    expect(plan.map((g) => g.items.map((i) => i.id))).toEqual([
      ["jacket", "shirt"],
      ["radio"],
      ["tv"],
      ["rug"],
    ])
  })
})

describe("parseCharityRules", () => {
  it("keeps valid rows and drops rows with an unknown category or acceptance", () => {
    const csv = [
      "charity,category,accepted,notes,source",
      'Salvos Stores,clothing,yes,"Clean, no rips",https://example.org',
      "Bad Row,spaceships,yes,,",
      "Nope,toys,no,,",
      "",
    ].join("\n")
    expect(parseCharityRules(csv)).toEqual([
      {
        charity: "Salvos Stores",
        category: "clothing",
        accepted: "yes",
        notes: "Clean, no rips",
        source: "https://example.org",
      },
    ])
  })

  it("loads the real charities.csv", async () => {
    const { CHARITY_RULES } = await import("./charities")
    expect(CHARITY_RULES.length).toBeGreaterThanOrEqual(10)
  })
})
