import { useState, type ReactNode } from "react"
import { ArrowRight, Plus } from "lucide-react"
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
import { CATEGORIES, CONDITIONS, type Item } from "@/lib/types"

export function ReviewStep({
  initialItems,
  onMakePlan,
  onStartAgain,
}: {
  initialItems: Item[]
  onMakePlan: (items: Item[]) => void
  onStartAgain: () => void
}) {
  const [items, setItems] = useState(initialItems)
  const named = items.filter((item) => item.name.trim())
  const givingCount = named.filter((item) => item.giveAway).length

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>Check your list</h1>
        <p className={TYPE.bodyRelaxed}>
          {items.length > 0
            ? "Gemma can get things wrong. Untick what you're keeping, fix anything that looks off, and add what it missed. Mark broken things as broken."
            : "Gemma didn't spot anything to give away. Add your items yourself."}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <ItemRow item={item} onChange={(patch) => update(item.id, patch)} />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={addItem}>
          <Plus size={ICON.md} />
          Add item
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onStartAgain}>
            Start again
          </Button>
          <Button
            size="lg"
            disabled={givingCount === 0}
            onClick={() => onMakePlan(named)}
          >
            Make my plan
            <ArrowRight size={ICON.md} />
          </Button>
        </div>
      </div>
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
    <Card size="sm" className={item.giveAway ? "" : "opacity-60"}>
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
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 pl-7 sm:grid-cols-[1fr_5rem_1fr]">
          <Field
            label="Category"
            htmlFor={id("category")}
            className="col-span-2 sm:col-span-1"
          >
            <Select
              items={CATEGORY_LABELS}
              value={item.category}
              onValueChange={(category) => category && onChange({ category })}
            >
              <SelectTrigger id={id("category")} className="w-full">
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
              <SelectTrigger id={id("condition")} className="w-full">
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
