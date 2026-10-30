import type { Room } from "./types"

export const DEFAULT_ROOMS: Room[] = [
  "Living room",
  "Kitchen",
  "Bedroom",
  "Bathroom",
  "Dining room",
  "Study",
  "Laundry",
  "Garage or shed",
].map((name) => ({
  id: name.toLowerCase().replace(/\W+/g, "-"),
  name,
  items: null,
}))

// Opening the phone camera can reload the page, so answers and rooms are kept in the browser.
export const ROOMS_KEY = "looped:rooms"
export const CLEAR_OUT_KEY = "looped:clear-out"

export function loadSaved<T>(key: string, fallback: T): T {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null")
    if (saved !== null && (!Array.isArray(saved) || saved.length > 0)) {
      return saved as T
    }
  } catch {
    // Unreadable or blocked storage: start fresh.
  }
  return fallback
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode or full storage: everything still works for this visit.
  }
}

export const givingItems = (rooms: Room[]) =>
  rooms.flatMap((room) => room.items ?? []).filter((item) => item.giveAway)
