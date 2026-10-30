import { groupKey as destinationKey } from "./route"
import type { PlanGroup } from "./types"

const DONATED_KEY = "looped:donated"

/** Stable key for a plan group, used to remember which groups were donated. */
export function groupKey(group: PlanGroup): string {
  return destinationKey(group.destination)
}

export function donatedCount(plan: PlanGroup[], donated: string[]): number {
  const keys = new Set(donated)
  return plan.filter((group) => keys.has(groupKey(group))).length
}

export function loadDonated(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(DONATED_KEY) ?? "null")
    if (
      Array.isArray(saved) &&
      saved.every((key) => typeof key === "string")
    ) {
      return saved
    }
  } catch {
    // Unreadable or blocked storage: start fresh.
  }
  return []
}

export function saveDonated(donated: string[]) {
  try {
    localStorage.setItem(DONATED_KEY, JSON.stringify(donated))
  } catch {
    // Private mode or full storage: the ticks still work for this visit.
  }
}
