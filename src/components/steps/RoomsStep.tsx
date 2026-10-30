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
import { DEADLINE_LABELS, SITUATION_LABELS } from "@/lib/labels"
import { givingItems } from "@/lib/rooms"
import type { ClearOut, Room } from "@/lib/types"

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
  clearOut,
  onChangeClearOut,
  onOpenRoom,
  onAddRoom,
  onMakePlan,
  onClearAll,
}: {
  rooms: Room[]
  clearOut: ClearOut
  onChangeClearOut: () => void
  onOpenRoom: (room: Room) => void
  onAddRoom: (name: string) => void
  onMakePlan: () => void
  onClearAll: () => void
}) {
  const [newRoom, setNewRoom] = useState("")
  const doneCount = rooms.filter((room) => room.items).length
  const givingCount = givingItems(rooms).length
  const situation = clearOut.situation
    ? SITUATION_LABELS[clearOut.situation]
    : null
  const deadline = clearOut.deadline
    ? clearOut.deadline === "no_rush"
      ? "There's no set date."
      : `The house needs to be empty ${DEADLINE_LABELS[clearOut.deadline].toLowerCase()}.`
    : null

  function addRoom(event: FormEvent) {
    event.preventDefault()
    if (!newRoom.trim()) return
    onAddRoom(newRoom.trim())
    setNewRoom("")
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className={TYPE.pageTitle}>Choose a room</h1>
        <p className={TYPE.bodyRelaxed}>
          Start with any room. When it's done, come back here for the next one.
        </p>
        {doneCount > 0 && (
          <p className={TYPE.caption}>
            {doneCount} {doneCount === 1 ? "room" : "rooms"} done.{" "}
            {plural(givingCount)} to give away.
          </p>
        )}
        {(situation || deadline) && (
          <div className="flex flex-col gap-1">
            {situation && <p className="text-base">{situation}</p>}
            {deadline && <p className={TYPE.caption}>{deadline}</p>}
          </div>
        )}
        <button
          type="button"
          onClick={onChangeClearOut}
          className="self-start text-base font-medium text-pine underline-offset-4 hover:underline"
        >
          {situation || deadline
            ? "Change these details"
            : "Add details about this clear-out"}
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-3">
        {rooms.map((room) => {
          const Icon = ROOM_ICONS[room.id] ?? House
          const giving = room.items?.filter((item) => item.giveAway).length
          return (
            <li key={room.id}>
              <button
                type="button"
                onClick={() => onOpenRoom(room)}
                className={cn(
                  "relative flex h-full w-full flex-col gap-3 rounded-2xl p-4 text-left transition-transform active:scale-[0.98]",
                  "bg-sage",
                  room.items && "ring-2 ring-pine"
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
                  <span className="text-base font-medium">{room.name}</span>
                  <span className="text-base text-muted-foreground">
                    {giving === undefined
                      ? "Tap to start"
                      : `${giving} to give away`}
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
          placeholder="Add a room, like Bedroom 2"
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
            ? "Do a room first"
            : `Find a home for ${plural(givingCount)}`}
          {givingCount > 0 && <ArrowRight size={ICON.md} />}
        </Button>
        {doneCount > 0 && (
          <Button variant="ghost" onClick={onClearAll}>
            Start over
          </Button>
        )}
      </ActionBar>
    </div>
  )
}
