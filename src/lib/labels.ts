import type { Category, Condition, Deadline, Situation } from "./types"

export const CATEGORY_LABELS: Record<Category, string> = {
  furniture: "Furniture",
  clothing: "Clothing",
  electronics: "Electronics",
  kitchenware: "Kitchen things",
  books_media: "Books, CDs and DVDs",
  decor: "Home decor",
  linen: "Sheets and towels",
  toys: "Toys",
  other: "Other",
}

export const CONDITION_LABELS: Record<Condition, string> = {
  good: "Good",
  worn: "Worn",
  broken: "Broken",
  unsure: "Not sure",
}

export const SITUATION_LABELS: Record<Situation, string> = {
  loved_one: "Clearing a loved one's home",
  aged_care: "Moving into aged care",
  downsizing: "Downsizing",
  moving_in: "Moving in together",
  separation: "Separation",
}

export const DEADLINE_LABELS: Record<Deadline, string> = {
  weekend: "This weekend",
  two_weeks: "In 2 weeks",
  month: "In a month",
  no_rush: "No rush",
}
