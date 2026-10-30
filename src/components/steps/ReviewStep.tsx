import { useState, type ReactNode } from "react"
import {
  Armchair,
  BedDouble,
  Check,
  BookOpen,
  CircleHelp,
  CookingPot,
  Lamp,
  Monitor,
  Plus,
  Puzzle,
  RotateCcw,
  Shirt,
  type LucideIcon,
} from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/labels"
import { CATEGORIES, CONDITIONS, type Category, type Item } from "@/lib/types"

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
  onFilmAgain,
  onBack,
}: {
  roomName: string
  initialItems: Item[]
  onSave: (items: Item[]) => void
  onFilmAgain: () => void
  onBack: () => void
}) {
  const [items, setItems] = useState(initialItems)
  const named = items.filter((item) => item.name.trim())

  function update(id: string, patch: Partial<Item>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
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

  const piles = CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((pile) => pile.items.length > 0)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>{roomName}</h1>
        <p className={TYPE.bodyRelaxed}>
          {items.length > 0
            ? `${plural(items.length)} found. Untick what you're keeping.`
            : "Gemma didn't spot anything to give away. Add your items yourself."}
        </p>
        {items.length > 0 && (
          <p className={TYPE.caption}>
            Gemma can get things wrong. Fix anything that looks off, add what it
            missed, and mark broken things as broken.
          </p>
        )}
      </div>

      {piles.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {piles.map(({ category, items: pileItems }, index) => {
            const Icon = CATEGORY_ICONS[category]
            const giving = pileItems.filter((item) => item.giveAway).length
            return (
              <li
                key={category}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl p-4",
                  index % 4 === 1 || index % 4 === 2 ? "bg-peach" : "bg-sage"
                )}
              >
                <Icon size={ICON.xl} strokeWidth={1.5} aria-hidden />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-xs text-foreground/65">
                    {plural(giving)} to give
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
                <ItemRow
                  item={item}
                  onChange={(patch) => update(item.id, patch)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={addItem}>
          <Plus size={ICON.md} />
          Add item
        </Button>
        <Button variant="ghost" onClick={onFilmAgain}>
          <RotateCcw size={ICON.md} />
          Film this room again
        </Button>
      </div>

      <ActionBar>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="lg" onClick={onBack}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1" onClick={() => onSave(named)}>
            <Check size={ICON.md} />
            Save room
          </Button>
        </div>
      </ActionBar>
    </div>
  )
}

function ItemRow({
  item,
  onChange,
}: {
  item: Item
  onChange: (patch: Partial<Item>) => void
}) {
  const id = (field: string) => `${item.id}-${field}`

  return (
    <Card
      size="sm"
      className={cn("rounded-2xl", !item.giveAway && "opacity-60")}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={item.giveAway}
            onCheckedChange={(checked) => onChange({ giveAway: checked })}
            aria-label={`Give away ${item.name || "this item"}`}
          />
          <Label htmlFor={id("name")} className="sr-only">
            Item name
          </Label>
          <Input
            id={id("name")}
            value={item.name}
            placeholder="What is it?"
            className="h-10 rounded-full px-4"
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 pl-7">
          <Field
            label="Category"
            htmlFor={id("category")}
            className="col-span-2"
          >
            <Select
              items={CATEGORY_LABELS}
              value={item.category}
              onValueChange={(category) => category && onChange({ category })}
            >
              <SelectTrigger
                id={id("category")}
                className="w-full rounded-full px-4 data-[size=default]:h-10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="How many" htmlFor={id("quantity")}>
            <Input
              id={id("quantity")}
              type="number"
              inputMode="numeric"
              min={1}
              className="h-10 rounded-full px-4"
              value={item.quantity}
              onFocus={(event) => event.target.select()}
              onChange={(event) =>
                onChange({
                  quantity: Math.max(
                    1,
                    Math.round(Number(event.target.value)) || 1
                  ),
                })
              }
            />
          </Field>
          <Field label="Condition" htmlFor={id("condition")}>
            <Select
              items={CONDITION_LABELS}
              value={item.condition}
              onValueChange={(condition) =>
                condition && onChange({ condition })
              }
            >
              <SelectTrigger
                id={id("condition")}
                className="w-full rounded-full px-4 data-[size=default]:h-10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {CONDITION_LABELS[condition]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <Label htmlFor={htmlFor} className={TYPE.label}>
        {label}
      </Label>
      {children}
    </div>
  )
}
