import { useState, type FormEvent } from "react"
import {
  ArrowRight,
  Bath,
  BedDouble,
  BookOpen,
  CircleCheck,
  CookingPot,
  House,
  Plus,
  Sofa,
  UtensilsCrossed,
  Warehouse,
  WashingMachine,
  type LucideIcon,
} from "lucide-react"
import { ActionBar } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ICON, TYPE } from "@/components/design-system"
import { cn } from "@/lib/utils"
import { givingItems } from "@/lib/rooms"
import type { Room } from "@/lib/types"

const ROOM_ICONS: Record<string, LucideIcon> = {
  "living-room": Sofa,
  kitchen: CookingPot,
  bedroom: BedDouble,
  bathroom: Bath,
  "dining-room": UtensilsCrossed,
  study: BookOpen,
  laundry: WashingMachine,
  "garage-or-shed": Warehouse,
}

const plural = (count: number) => `${count} ${count === 1 ? "thing" : "things"}`

export function RoomsStep({
  rooms,
  onOpenRoom,
  onAddRoom,
  onMakePlan,
  onClearAll,
}: {
  rooms: Room[]
  onOpenRoom: (room: Room) => void
  onAddRoom: (name: string) => void
  onMakePlan: () => void
  onClearAll: () => void
}) {
  const [newRoom, setNewRoom] = useState("")
  const doneCount = rooms.filter((room) => room.items).length
  const givingCount = givingItems(rooms).length

  function addRoom(event: FormEvent) {
    event.preventDefault()
    if (!newRoom.trim()) return
    onAddRoom(newRoom.trim())
    setNewRoom("")
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>Pick a room</h1>
        <p className={TYPE.bodyRelaxed}>
          Do one room at a time. Film it, check the list, then come back here
          for the next one.
        </p>
        {doneCount > 0 && (
          <p className={TYPE.caption}>
            {doneCount} of {rooms.length} rooms done · {plural(givingCount)} to
            give away
          </p>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-3">
        {rooms.map((room, index) => {
          const Icon = ROOM_ICONS[room.id] ?? House
          const giving = room.items?.filter((item) => item.giveAway).length
          return (
            <li key={room.id}>
              <button
                type="button"
                onClick={() => onOpenRoom(room)}
                className={cn(
                  "relative flex h-full w-full flex-col gap-3 rounded-2xl p-4 text-left transition-transform active:scale-[0.98]",
                  room.items
                    ? "bg-card ring-2 ring-pine"
                    : index % 4 === 1 || index % 4 === 2
                      ? "bg-peach"
                      : "bg-sage"
                )}
              >
                <Icon size={ICON.xl} strokeWidth={1.5} aria-hidden />
                {room.items && (
                  <CircleCheck
                    size={ICON.md}
                    className="absolute top-4 right-4 text-pine"
                    aria-hidden
                  />
                )}
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{room.name}</span>
                  <span className="text-xs text-foreground/65">
                    {giving === undefined
                      ? "Tap to film"
                      : `${plural(giving)} to give`}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <form onSubmit={addRoom} className="flex items-center gap-2">
        <Label htmlFor="new-room" className="sr-only">
          Room name
        </Label>
        <Input
          id="new-room"
          value={newRoom}
          placeholder="Another room, like Bedroom 2"
          className="h-10 rounded-full px-4"
          onChange={(event) => setNewRoom(event.target.value)}
        />
        <Button type="submit" variant="outline" disabled={!newRoom.trim()}>
          <Plus size={ICON.md} />
          Add
        </Button>
      </form>

      <ActionBar>
        <Button
          size="lg"
          className="w-full"
          disabled={givingCount === 0}
          onClick={onMakePlan}
        >
          {givingCount === 0
            ? "Film a room to start"
            : `Find homes for ${plural(givingCount)}`}
          {givingCount > 0 && <ArrowRight size={ICON.md} />}
        </Button>
        {doneCount > 0 && (
          <Button variant="ghost" onClick={onClearAll}>
            Clear all rooms and start over
          </Button>
        )}
      </ActionBar>
    </div>
  )
}
