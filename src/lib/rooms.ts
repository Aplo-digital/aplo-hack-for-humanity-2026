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

// Opening the phone camera can reload the page, so rooms are kept in the browser between visits.
const STORAGE_KEY = "looped:rooms"

export function loadRooms(): Room[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
    if (Array.isArray(saved) && saved.length > 0) return saved as Room[]
  } catch {
    // Unreadable or blocked storage: start fresh.
  }
  return DEFAULT_ROOMS
}

export function saveRooms(rooms: Room[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
  } catch {
    // Private mode or full storage: the rooms still work for this visit.
  }
}

export const givingItems = (rooms: Room[]) =>
  rooms.flatMap((room) => room.items ?? []).filter((item) => item.giveAway)
