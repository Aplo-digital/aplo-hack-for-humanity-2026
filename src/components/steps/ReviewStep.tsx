import { useState } from "react"
import {
  Armchair,
  BedDouble,
  BookOpen,
  Camera,
  Check,
  CircleHelp,
  CookingPot,
  Lamp,
  Monitor,
  Plus,
  Puzzle,
  Shirt,
  type LucideIcon,
} from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { ReviewItemCard } from "@/components/steps/ReviewItemCard"
import { Button } from "@/components/ui/button"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"
import { CATEGORY_LABELS } from "@/lib/labels"
import { CATEGORIES, type Category, type Item } from "@/lib/types"

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  furniture: Armchair,
  clothing: Shirt,
  electronics: Monitor,
  kitchenware: CookingPot,
  books_media: BookOpen,
  decor: Lamp,
  linen: BedDouble,
  toys: Puzzle,
  other: CircleHelp,
}

const plural = (count: number) => `${count} ${count === 1 ? "thing" : "things"}`

export function ReviewStep({
  roomName,
  initialItems,
  onSave,
  onAddPhotos,
}: {
  roomName: string
  initialItems: Item[]
  onSave: (items: Item[]) => void
  onAddPhotos: () => void
}) {
  const [items, setItems] = useState(initialItems)
  const [confirmed, setConfirmed] = useState<ReadonlySet<string>>(new Set())

  function update(id: string, patch: Partial<Item>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }

  function setItemConfirmed(id: string, isConfirmed: boolean) {
    setConfirmed((current) => {
      const next = new Set(current)
      if (isConfirmed) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id))
    setItemConfirmed(id, false)
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        category: "other",
        quantity: 1,
        condition: "good",
        giveAway: true,
      },
    ])
  }

  function confirmAndSave() {
    onSave(
      items
        .filter((item) => item.name.trim())
        .map((item) => ({ ...item, giveAway: true }))
    )
  }

  const piles = CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((pile) => pile.items.length > 0)

  const confirmedCount = items.filter((item) => confirmed.has(item.id)).length

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>{roomName}</h1>
        {items.length > 0 ? (
          <>
            <p className={TYPE.bodyRelaxed}>
              We found {plural(items.length)}. Confirm each one, and remove
              anything you're keeping.
            </p>
            <p className={TYPE.caption}>
              We can get things wrong. Fix any mistakes, add anything we
              missed, and set broken things to “Broken”.
            </p>
          </>
        ) : (
          <p className={TYPE.bodyRelaxed}>
            Nothing to pass on yet. Add more photos of this room, or add things
            yourself.
          </p>
        )}
      </div>

      {piles.length > 0 && (
        <ul className="grid grid-cols-2 gap-3" aria-label="Piles by type">
          {piles.map(({ category, items: pileItems }) => {
            const Icon = CATEGORY_ICONS[category]
            return (
              <li
                key={category}
                className="flex flex-col gap-3 rounded-2xl bg-sage p-4"
              >
                <Icon size={ICON.xl} strokeWidth={1.5} aria-hidden />
                <div className="flex flex-col">
                  <span className="text-base font-medium">
                    {CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-base text-muted-foreground">
                    {plural(pileItems.length)} to give away
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {piles.map(({ category, items: pileItems }) => (
        <section
          key={category}
          aria-labelledby={`pile-${category}`}
          className="flex flex-col gap-3"
        >
          <h2 id={`pile-${category}`} className={TYPE.sectionTitle}>
            {CATEGORY_LABELS[category]}
          </h2>
          <ul className="flex flex-col gap-3">
            {pileItems.map((item) => (
              <li key={item.id}>
                <ReviewItemCard
                  item={item}
                  confirmed={confirmed.has(item.id)}
                  onChange={(patch) => update(item.id, patch)}
                  onConfirm={() => setItemConfirmed(item.id, true)}
                  onEdit={() => setItemConfirmed(item.id, false)}
                  onRemove={() => remove(item.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Button variant="outline" className="self-start" onClick={addItem}>
        <Plus size={ICON.md} aria-hidden />
        Add something
      </Button>

      <ActionBar>
        {items.length > 0 && (
          <p className={cn(TYPE.caption, "text-center")} aria-live="polite">
            {confirmedCount} of {items.length} confirmed
          </p>
        )}
        {items.length > 0 ? (
          <>
            <Button size="lg" className="w-full" onClick={confirmAndSave}>
              <Check size={ICON.md} aria-hidden />
              Confirm and save
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={onAddPhotos}
            >
              <Camera size={ICON.md} aria-hidden />
              Add more photos
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" className="w-full" onClick={onAddPhotos}>
              <Camera size={ICON.md} aria-hidden />
              Add more photos
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => onSave([])}
            >
              Save with nothing to pass on
            </Button>
          </>
        )}
      </ActionBar>
    </div>
  )
}
