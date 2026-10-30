import { randomUUID } from "node:crypto"
import { GoogleGenAI, ThinkingLevel } from "@google/genai"
import { z } from "zod"
import {
  CATEGORIES,
  CONDITIONS,
  type Item,
  type PlanFact,
} from "../src/lib/types.ts"

const MODEL = "gemma-4-26b-a4b-it"
// The browser shrinks videos first (src/lib/shrinkVideo.ts); Netlify caps binary bodies at about 4.5 MB.
export const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024
const VIDEO_TYPES = ["video/webm", "video/mp4", "video/quicktime"]

const ANALYSE_PROMPT =
  'List every household item in this footage that someone moving out could donate or dispose of. Return only JSON: a list of objects with keys "item" (short name), "category" (one of: furniture, clothing, electronics, kitchenware, books_media, decor, linen, toys, other), "quantity" (integer), "condition" (good, worn, broken or unsure). Ignore walls, windows, floors and fixtures that stay with the house.'

/** An error whose message is safe and useful to show the person using the app. */
export class UserError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function createGemma(apiKey: string | undefined) {
  const hasKey = Boolean(apiKey) && apiKey !== "paste-your-key-here"
  // The API answered "500 INTERNAL" on about half of single calls on 30 October; 5 attempts made it reliable.
  const client = hasKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          retryOptions: { attempts: 5, initialDelay: 1, maxDelay: 8 },
        },
      })
    : undefined

  async function generate(
    contents: Parameters<
      GoogleGenAI["models"]["generateContent"]
    >[0]["contents"],
    json: boolean
  ): Promise<string> {
    if (!client) {
      throw new UserError(
        500,
        "No Gemini API key found. Copy sample.env to .env, paste your key into it, then restart npm run dev."
      )
    }
    try {
      const response = await client.models.generateContent({
        model: MODEL,
        contents,
        config: {
          // Without minimal thinking, Gemma takes 20 to 60 seconds to answer.
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          ...(json && { responseMimeType: "application/json" }),
        },
      })
      return response.text ?? ""
    } catch (error) {
      console.error("[gemma]", error)
      throw new UserError(
        502,
        "Gemma couldn't answer right now. Please try again in a moment."
      )
    }
  }

  return {
    async analyseVideo(video: Uint8Array, mimeType: string): Promise<Item[]> {
      const type = mimeType.split(";")[0].trim()
      if (!VIDEO_TYPES.includes(type)) {
        throw new UserError(415, "Please upload a video file.")
      }
      if (video.byteLength === 0) throw new UserError(400, "The video was empty.")
      if (video.byteLength > MAX_UPLOAD_BYTES) {
        throw new UserError(413, "That video is too big to send. Try a shorter clip.")
      }
      const text = await generate(
        [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: type,
                  data: Buffer.from(video).toString("base64"),
                },
              },
              { text: ANALYSE_PROMPT },
            ],
          },
        ],
        true
      )
      return parseItems(text)
    },

    async writePlanSummary(body: unknown): Promise<string> {
      const facts = PlanFacts.safeParse(body)
      if (!facts.success || facts.data.length === 0) {
        throw new UserError(
          400,
          "The plan was empty or not in the expected shape."
        )
      }
      const text = await generate(planPrompt(facts.data), false)
      return text.trim()
    },
  }
}

const lowercase = z.string().trim().toLowerCase()

const GemmaItem = z.object({
  item: z.string().trim().min(1),
  category: lowercase.pipe(z.enum(CATEGORIES)).catch("other"),
  quantity: z.coerce
    .number()
    .catch(1)
    .transform((n) => Math.max(1, Math.round(n) || 1)),
  condition: lowercase.pipe(z.enum(CONDITIONS)).catch("unsure"),
})

export function parseItems(text: string): Item[] {
  let json: unknown
  try {
    json = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""))
  } catch {
    throw new UserError(
      502,
      "Gemma's answer wasn't a list we could read. Please try again."
    )
  }
  const list = Array.isArray(json)
    ? json
    : (Object.values(json ?? {}).find(Array.isArray) ?? [])
  return list.flatMap((entry: unknown) => {
    const parsed = GemmaItem.safeParse(entry)
    if (!parsed.success) return []
    const { item, category, quantity, condition } = parsed.data
    return [
      {
        id: randomUUID(),
        name: item,
        category,
        quantity,
        condition,
        giveAway: true,
      },
    ]
  })
}

const PlanFacts = z
  .array(
    z.object({
      destination: z.string(),
      notes: z.string(),
      items: z.array(z.object({ name: z.string(), quantity: z.number() })),
    })
  )
  .max(50) satisfies z.ZodType<PlanFact[]>

function planPrompt(facts: PlanFact[]): string {
  const lines = facts.map(
    (f) =>
      `- ${f.destination}: ${f.items.map((i) => `${i.quantity} x ${i.name}`).join(", ")}. Notes: ${f.notes}`
  )
  return [
    "Someone is moving out and giving things away. Here is their plan:",
    ...lines,
    "",
    "Write 3 to 5 short, friendly sentences for them that say what goes where, naming each charity. Use only the facts above; don't invent shops, addresses or rules. Plain text, no lists or markdown. End with a reminder to check with the store before dropping things off.",
  ].join("\n")
}
