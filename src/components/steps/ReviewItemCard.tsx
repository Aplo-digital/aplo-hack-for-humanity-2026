import { useEffect, useRef, type ReactNode } from "react"
import { Check, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

/** One thing in the room: editable until confirmed, then a read-only summary. */
export function ReviewItemCard({
  item,
  confirmed,
  onChange,
  onConfirm,
  onEdit,
  onRemove,
}: {
  item: Item
  confirmed: boolean
  onChange: (patch: Partial<Item>) => void
  onConfirm: () => void
  onEdit: () => void
  onRemove: () => void
}) {
  const id = (field: string) => `${item.id}-${field}`
  const displayName = item.name.trim() || "this item"

  const editButton = useRef<HTMLButtonElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const toggled = useRef(false)
  useEffect(() => {
    if (!toggled.current) return
    toggled.current = false
    if (confirmed) editButton.current?.focus()
    else nameInput.current?.focus()
  }, [confirmed])

  const removeButton = (
    <Button
      variant="ghost"
      size="icon"
      className="-mt-1 -mr-1 shrink-0 text-muted-foreground hover:text-destructive"
      onClick={onRemove}
      aria-label={`Remove ${displayName}`}
    >
      <Trash2 size={ICON.md} />
    </Button>
  )

  if (confirmed) {
    return (
      <Card size="sm" className="rounded-2xl bg-sage/60">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h3 className={cn(TYPE.cardTitle, "truncate")}>{displayName}</h3>
              <span className="inline-flex w-fit items-center gap-1 text-base font-medium text-pine">
                <Check size={ICON.sm} aria-hidden />
                Confirmed
              </span>
            </div>
            {removeButton}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip className="bg-card">{CATEGORY_LABELS[item.category]}</Chip>
            <Chip className="bg-card">
              <span className="sr-only">Quantity </span>
              {item.quantity} ×
            </Chip>
            <Chip className="bg-card">{CONDITION_LABELS[item.condition]}</Chip>
            <Button
              ref={editButton}
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => {
                toggled.current = true
                onEdit()
              }}
              aria-label={`Edit ${displayName}`}
            >
              <Pencil size={ICON.sm} aria-hidden />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card size="sm" className="rounded-2xl">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-2">
          <Field label="What is it?" htmlFor={id("name")} className="flex-1">
            <Input
              ref={nameInput}
              id={id("name")}
              value={item.name}
              placeholder="For example, armchair"
              className="h-10 rounded-full px-4"
              onChange={(event) => onChange({ name: event.target.value })}
            />
          </Field>
          {removeButton}
        </div>
        <Field label="Type" htmlFor={id("category")}>
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
        <div className="grid grid-cols-2 gap-3">
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
        <Button
          variant="ghost"
          className="h-11 w-full border border-dashed border-pine/40 text-pine"
          disabled={!item.name.trim()}
          onClick={() => {
            toggled.current = true
            onConfirm()
          }}
          aria-label={`Confirm ${displayName}`}
        >
          <Check size={ICON.md} aria-hidden />
          Confirm
        </Button>
      </CardContent>
    </Card>
  )
}

function Chip({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-base text-foreground",
        className
      )}
    >
      {children}
    </span>
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
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className={TYPE.label}>
        {label}
      </Label>
      {children}
    </div>
  )
}
