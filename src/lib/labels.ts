import type { Category, Condition } from "./types"

export const CATEGORY_LABELS: Record<Category, string> = {
  furniture: "Furniture",
  clothing: "Clothing",
  electronics: "Electronics",
  kitchenware: "Kitchenware",
  books_media: "Books and media",
  decor: "Decor",
  linen: "Linen",
  toys: "Toys",
  other: "Other",
}

export const CONDITION_LABELS: Record<Condition, string> = {
  good: "Good",
  worn: "Worn",
  broken: "Broken",
  unsure: "Not sure",
}
