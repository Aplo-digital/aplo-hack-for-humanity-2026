import { useEffect, useMemo, useState } from "react"
import { AppLayout } from "@/components/AppLayout"
import { AnalysingStep } from "@/components/steps/AnalysingStep"
import { ErrorStep } from "@/components/steps/ErrorStep"
import { PlanStep } from "@/components/steps/PlanStep"
import { ReviewStep } from "@/components/steps/ReviewStep"
import { RoomsStep } from "@/components/steps/RoomsStep"
import { UploadStep } from "@/components/steps/UploadStep"
import { WelcomeStep } from "@/components/steps/WelcomeStep"
import { analysePhotos, analyseVideo } from "@/lib/api"
import { DEFAULT_ROOMS, givingItems, loadRooms, saveRooms } from "@/lib/rooms"
import type { AppState, Item, Room } from "@/lib/types"

export function App() {
  const [state, setState] = useState<AppState>({ step: "welcome" })
  const [rooms, setRooms] = useState<Room[]>(loadRooms)
  // Memoised so the plan (and its Gemma summary) only refreshes when the rooms change.
  const planItems = useMemo(() => givingItems(rooms), [rooms])
  const toRooms = () => setState({ step: "rooms" })
  const roomName = (roomId: string) =>
    rooms.find((room) => room.id === roomId)?.name ?? "room"

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.step])

  useEffect(() => saveRooms(rooms), [rooms])

  async function analyse(
    roomId: string,
    source: string,
    run: () => Promise<Item[]>
  ) {
    setState({ step: "analysing", roomId, source })
    try {
      const items = await run()
      setState({ step: "review", roomId, items })
    } catch (error) {
      setState({ step: "error", roomId, message: (error as Error).message })
    }
  }

  function openRoom(room: Room) {
    setState(
      room.items
        ? { step: "review", roomId: room.id, items: room.items }
        : { step: "upload", roomId: room.id }
    )
  }

  function saveRoom(roomId: string, items: Item[]) {
    setRooms((current) =>
      current.map((room) => (room.id === roomId ? { ...room, items } : room))
    )
    toRooms()
  }

  function addRoom(name: string) {
    const id = `${name.toLowerCase().replace(/\W+/g, "-")}-${crypto.randomUUID().slice(0, 4)}`
    setRooms((current) => [...current, { id, name, items: null }])
  }

  function clearAll() {
    if (window.confirm("Clear every room's list and start over?")) {
      setRooms(DEFAULT_ROOMS)
      toRooms()
    }
  }

  return (
    <AppLayout>
      {state.step === "welcome" && <WelcomeStep onBegin={toRooms} />}
      {state.step === "rooms" && (
        <RoomsStep
          rooms={rooms}
          onOpenRoom={openRoom}
          onAddRoom={addRoom}
          onMakePlan={() => setState({ step: "plan" })}
          onClearAll={clearAll}
        />
      )}
      {state.step === "upload" && (
        <UploadStep
          roomName={roomName(state.roomId)}
          onVideo={(file) =>
            analyse(state.roomId, file.name, () => analyseVideo(file))
          }
          onPhotos={(files) =>
            analyse(
              state.roomId,
              `${files.length} ${files.length === 1 ? "photo" : "photos"}`,
              () => analysePhotos(files)
            )
          }
          onBack={toRooms}
        />
      )}
      {state.step === "analysing" && (
        <AnalysingStep
          roomName={roomName(state.roomId)}
          source={state.source}
        />
      )}
      {state.step === "review" && (
        <ReviewStep
          key={state.roomId}
          roomName={roomName(state.roomId)}
          initialItems={state.items}
          onSave={(items) => saveRoom(state.roomId, items)}
          onFilmAgain={() => setState({ step: "upload", roomId: state.roomId })}
          onBack={toRooms}
        />
      )}
      {state.step === "plan" && (
        <PlanStep items={planItems} onEdit={toRooms} onStartAgain={clearAll} />
      )}
      {state.step === "error" && (
        <ErrorStep
          message={state.message}
          onTryAgain={() => setState({ step: "upload", roomId: state.roomId })}
        />
      )}
    </AppLayout>
  )
}
