import { useEffect, useState } from "react"
import { AppLayout } from "@/components/AppLayout"
import { AnalysingStep } from "@/components/steps/AnalysingStep"
import { ErrorStep } from "@/components/steps/ErrorStep"
import { PlanStep } from "@/components/steps/PlanStep"
import { ReviewStep } from "@/components/steps/ReviewStep"
import { UploadStep } from "@/components/steps/UploadStep"
import { WelcomeStep } from "@/components/steps/WelcomeStep"
import { analyseVideo } from "@/lib/api"
import type { AppState } from "@/lib/types"

type Screen = { step: "welcome" } | AppState

export function App() {
  const [state, setState] = useState<Screen>({ step: "welcome" })
  const startAgain = () => setState({ step: "upload" })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.step])

  async function handleVideo(file: File) {
    setState({ step: "analysing", fileName: file.name })
    try {
      const items = await analyseVideo(file)
      setState({ step: "review", items })
    } catch (error) {
      setState({ step: "error", message: (error as Error).message })
    }
  }

  return (
    <AppLayout>
      {state.step === "welcome" && (
        <WelcomeStep onBegin={() => setState({ step: "upload" })} />
      )}
      {state.step === "upload" && <UploadStep onVideo={handleVideo} />}
      {state.step === "analysing" && (
        <AnalysingStep fileName={state.fileName} />
      )}
      {state.step === "review" && (
        <ReviewStep
          initialItems={state.items}
          onMakePlan={(items) => setState({ step: "plan", items })}
          onStartAgain={startAgain}
        />
      )}
      {state.step === "plan" && (
        <PlanStep
          items={state.items}
          onEdit={() => setState({ step: "review", items: state.items })}
          onStartAgain={startAgain}
        />
      )}
      {state.step === "error" && (
        <ErrorStep message={state.message} onTryAgain={startAgain} />
      )}
    </AppLayout>
  )
}
