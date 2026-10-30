import { useEffect, useMemo, useState } from "react"
import { AppLayout } from "@/components/AppLayout"
import { AnalysingStep } from "@/components/steps/AnalysingStep"
import { ErrorStep } from "@/components/steps/ErrorStep"
import { ImpactStep } from "@/components/steps/ImpactStep"
import { PlanStep } from "@/components/steps/PlanStep"
import { ReviewStep } from "@/components/steps/ReviewStep"
import { RoomsStep } from "@/components/steps/RoomsStep"
import { SituationStep } from "@/components/steps/SituationStep"
import { UploadStep } from "@/components/steps/UploadStep"
import { WelcomeStep } from "@/components/steps/WelcomeStep"
import { analysePhotos } from "@/lib/api"
import { loadDonated, saveDonated } from "@/lib/donations"
import {
  CLEAR_OUT_KEY,
  DEFAULT_ROOMS,
  ROOMS_KEY,
  givingItems,
  loadSaved,
  save,
} from "@/lib/rooms"
import type { AppState, ClearOut, Item, Room } from "@/lib/types"

export function App() {
  const [state, setState] = useState<AppState>({ step: "welcome" })
  const [rooms, setRooms] = useState(() => loadSaved(ROOMS_KEY, DEFAULT_ROOMS))
  const [clearOut, setClearOut] = useState(() =>
    loadSaved<ClearOut>(CLEAR_OUT_KEY, {})
  )
  const [donated, setDonated] = useState(loadDonated)
  const [situationReturn, setSituationReturn] = useState<"welcome" | "rooms">(
    "welcome"
  )
  const planItems = useMemo(() => givingItems(rooms), [rooms])
  const toRooms = () => setState({ step: "rooms" })
  const roomName = (roomId: string) =>
    rooms.find((room) => room.id === roomId)?.name ?? "room"

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.step])

  useEffect(() => save(ROOMS_KEY, rooms), [rooms])
  useEffect(() => save(CLEAR_OUT_KEY, clearOut), [clearOut])
  useEffect(() => saveDonated(donated), [donated])

  async function analyse(roomId: string, photos: File[]) {
    const source = `${photos.length} ${photos.length === 1 ? "photo" : "photos"}`
    setState({ step: "analysing", roomId, source })
    try {
      const items = await analysePhotos(photos)
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

  function toggleDonated(key: string) {
    setDonated((current) =>
      current.includes(key)
        ? current.filter((saved) => saved !== key)
        : [...current, key]
    )
  }

  function clearAll() {
    if (window.confirm("Start over? This clears the list for every room.")) {
      setRooms(DEFAULT_ROOMS)
      setDonated([])
      toRooms()
    }
  }

  return (
    <AppLayout
      onBack={
        state.step === "situation"
          ? () => setState({ step: situationReturn })
          : backFor(state, setState)
      }
    >
      {state.step === "welcome" && (
        <WelcomeStep
          onBegin={() => {
            setSituationReturn("welcome")
            setState({ step: "situation" })
          }}
        />
      )}
      {state.step === "situation" && (
        <SituationStep
          initial={clearOut}
          onDone={(answers) => {
            setClearOut(answers)
            toRooms()
          }}
        />
      )}
      {state.step === "rooms" && (
        <RoomsStep
          rooms={rooms}
          clearOut={clearOut}
          onChangeClearOut={() => {
            setSituationReturn("rooms")
            setState({ step: "situation" })
          }}
          onOpenRoom={openRoom}
          onAddRoom={addRoom}
          onMakePlan={() => setState({ step: "plan" })}
          onClearAll={clearAll}
        />
      )}
      {state.step === "upload" && (
        <UploadStep
          roomName={roomName(state.roomId)}
          onPhotos={(photos) => analyse(state.roomId, photos)}
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
          onAddPhotos={() => setState({ step: "upload", roomId: state.roomId })}
        />
      )}
      {state.step === "plan" && (
        <PlanStep
          items={planItems}
          clearOut={clearOut}
          donated={donated}
          onToggleDonated={toggleDonated}
          onAllDonated={() => setState({ step: "impact" })}
          onStartAgain={clearAll}
        />
      )}
      {state.step === "impact" && (
        <ImpactStep
          items={planItems}
          onBackToPlan={() => setState({ step: "plan" })}
          onStartAgain={clearAll}
        />
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

/** Where the header back arrow goes, or nothing when this step has no previous page. */
function backFor(
  state: AppState,
  setState: (next: AppState) => void
): (() => void) | undefined {
  switch (state.step) {
    case "welcome":
    case "analysing":
      return undefined
    case "situation":
    case "rooms":
      return () => setState({ step: "situation" })
    case "upload":
    case "review":
    case "plan":
      return () => setState({ step: "rooms" })
    case "impact":
      return () => setState({ step: "plan" })
    case "error":
      return () => setState({ step: "upload", roomId: state.roomId })
  }
}
