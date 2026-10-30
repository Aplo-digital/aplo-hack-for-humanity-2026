import { execFile } from "node:child_process"
import { randomUUID } from "node:crypto"
import { createWriteStream } from "node:fs"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { pipeline } from "node:stream/promises"
import { promisify } from "node:util"
import { GoogleGenAI, ThinkingLevel } from "@google/genai"
import ffmpegPath from "ffmpeg-static"
import { z } from "zod"
import {
  CATEGORIES,
  CONDITIONS,
  type Item,
  type PlanFact,
} from "../src/lib/types.ts"

const MODEL = "gemma-4-26b-a4b-it"
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024

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
    async analyseVideo(upload: AsyncIterable<Buffer>): Promise<Item[]> {
      const dir = await mkdtemp(path.join(tmpdir(), "pass-it-on-"))
      try {
        const original = path.join(dir, "upload")
        const small = path.join(dir, "small.mp4")
        await saveUpload(upload, original)
        await shrinkVideo(original, small)
        const video = await readFile(small)
        const text = await generate(
          [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "video/mp4",
                    data: video.toString("base64"),
                  },
                },
                { text: ANALYSE_PROMPT },
              ],
            },
          ],
          true
        )
        return parseItems(text)
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
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

async function saveUpload(upload: AsyncIterable<Buffer>, file: string) {
  let bytes = 0
  await pipeline(
    upload,
    async function* (chunks: AsyncIterable<Buffer>) {
      for await (const chunk of chunks) {
        bytes += chunk.length
        if (bytes > MAX_UPLOAD_BYTES) {
          throw new UserError(
            413,
            "That video is over 200 MB. Try a shorter clip."
          )
        }
        yield chunk
      }
    },
    createWriteStream(file)
  )
  if (bytes === 0) throw new UserError(400, "The video was empty.")
}

const run = promisify(execFile)

// 480p, 2 frames a second, no sound: a 53 MB phone video becomes about 560 KB and Gemma lists nearly the same items.
async function shrinkVideo(input: string, output: string) {
  if (!ffmpegPath)
    throw new Error("ffmpeg-static has no binary for this computer")
  try {
    await run(ffmpegPath, [
      "-y",
      "-i",
      input,
      "-vf",
      "scale=-2:480,fps=2",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "30",
      "-pix_fmt",
      "yuv420p",
      "-an",
      output,
    ])
  } catch (error) {
    console.error("[ffmpeg]", error)
    throw new UserError(
      422,
      "We couldn't read that video. Try another one, or record it again."
    )
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
