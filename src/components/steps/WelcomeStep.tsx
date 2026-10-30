import { ActionBar } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { TYPE } from "@/components/design-system"

export function WelcomeStep({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="rounded-2xl bg-sage px-4 pt-8 pb-4">
        <HomeIllustration />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className={TYPE.pageTitle}>
          Clearing a home doesn't have to mean throwing it away.
        </h1>
        <p className={TYPE.bodyRelaxed}>
          Film or photograph a room. We'll help you find the people who'll love
          your things next.
        </p>
      </div>
      <ActionBar>
        <Button size="lg" className="w-full" onClick={onBegin}>
          Let's begin
        </Button>
        <p className={`${TYPE.caption} text-center`}>
          No account needed. Take it one room at a time.
        </p>
      </ActionBar>
    </div>
  )
}

function HomeIllustration() {
  return (
    <svg
      viewBox="0 0 240 160"
      className="mx-auto w-full max-w-72 text-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="120" cy="92" r="66" className="fill-card/40" stroke="none" />
      <path d="M62 86 Q120 10 182 92" strokeDasharray="1 7" />
      <path
        d="M121 58c-10-7-9-15 0-11 9-4 10 4 0 11Z"
        className="fill-terracotta text-terracotta"
        strokeWidth="1.5"
      />
      <path d="M36 138V110l22-18 22 18v28" />
      <path d="M51 138v-14h14v14" />
      <path
        d="M168 124v-16a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v16"
        className="fill-peach"
      />
      <rect
        x="160"
        y="118"
        width="48"
        height="14"
        rx="6"
        className="fill-peach"
      />
      <path d="M167 132v6M201 132v6" />
      <path d="M20 138h200" />
    </svg>
  )
}
