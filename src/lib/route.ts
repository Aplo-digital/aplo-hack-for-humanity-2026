import type {
  CharityRule,
  Destination,
  Item,
  PlanFact,
  PlanGroup,
} from "./types"

const EWASTE_REASON =
  "Broken electronics go to an e-waste drop-off. Find one at https://recyclingnearyou.com.au/"
const HARD_RUBBISH_REASON =
  "Broken items can't be donated. Book a council hard rubbish collection or take them to your local recycling centre."
const ASK_REASON =
  "None of the charities in our list take this yet. Your local op shop may."

function destinationFor(item: Item, rules: CharityRule[]): Destination {
  if (item.condition === "broken") {
    const reason =
      item.category === "electronics" ? EWASTE_REASON : HARD_RUBBISH_REASON
    return { kind: "recycle", reason }
  }
  const forCategory = rules.filter((r) => r.category === item.category)
  const rule =
    forCategory.find((r) => r.accepted === "yes") ??
    forCategory.find((r) => r.accepted === "some")
  if (rule) return { kind: "charity", charity: rule.charity, rule }
  return { kind: "ask", reason: ASK_REASON }
}

// A charity's notes differ per category, so each charity and category pair gets its own group.
function groupKey(destination: Destination): string {
  return destination.kind === "charity"
    ? `charity:${destination.charity}:${destination.rule.category}`
    : `${destination.kind}:${destination.reason}`
}

const KIND_ORDER: Record<Destination["kind"], number> = {
  charity: 0,
  recycle: 1,
  ask: 2,
}

export function routeItems(items: Item[], rules: CharityRule[]): PlanGroup[] {
  const groups = new Map<string, PlanGroup>()
  for (const item of items) {
    if (!item.giveAway) continue
    const destination = destinationFor(item, rules)
    const key = groupKey(destination)
    const group = groups.get(key)
    if (group) group.items.push(item)
    else groups.set(key, { destination, items: [item] })
  }
  return [...groups.values()].sort(
    (a, b) => KIND_ORDER[a.destination.kind] - KIND_ORDER[b.destination.kind]
  )
}

export function destinationTitle(destination: Destination): string {
  switch (destination.kind) {
    case "charity":
      return destination.charity
    case "recycle":
      return "Recycling or council hard rubbish"
    case "ask":
      return "Ask your local op shop"
  }
}

export function planFacts(plan: PlanGroup[]): PlanFact[] {
  return plan.map(({ destination, items }) => ({
    destination: destinationTitle(destination),
    notes:
      destination.kind === "charity"
        ? destination.rule.notes
        : destination.reason,
    items: items.map(({ name, quantity }) => ({ name, quantity })),
  }))
}
