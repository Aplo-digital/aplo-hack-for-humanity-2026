import path from "path"
import type { IncomingMessage, ServerResponse } from "http"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Connect, type Plugin } from "vite"
import { MAX_UPLOAD_BYTES, UserError, createGemma } from "./server/gemma"

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let text = ""
  for await (const chunk of req) {
    text += chunk
    if (text.length > 1_000_000) throw new UserError(413, "Request too big.")
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new UserError(400, "Request body wasn't JSON.")
  }
}

// The Gemini key is only read here, on the dev server. It never reaches browser code.
function gemmaApi(apiKey: string | undefined): Plugin {
  const gemma = createGemma(apiKey)

  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.method !== "POST" || !req.url?.startsWith("/api/")) {
      next()
      return
    }
    try {
      if (req.url === "/api/analyse") {
        if (!req.headers["content-type"]?.startsWith("video/")) {
          throw new UserError(415, "Please upload a video file.")
        }
        if (Number(req.headers["content-length"]) > MAX_UPLOAD_BYTES) {
          throw new UserError(
            413,
            "That video is over 200 MB. Try a shorter clip."
          )
        }
        sendJson(res, 200, { items: await gemma.analyseVideo(req) })
      } else if (req.url === "/api/plan") {
        const summary = await gemma.writePlanSummary(await readJson(req))
        sendJson(res, 200, { summary })
      } else {
        sendJson(res, 404, { error: "Unknown API route." })
      }
    } catch (error) {
      if (error instanceof UserError) {
        sendJson(res, error.status, { error: error.message })
      } else {
        console.error("[api]", error)
        sendJson(res, 500, {
          error: "Something went wrong on our side. Please try again.",
        })
      }
    }
  }

  return {
    name: "gemma-api",
    configureServer: (server) => void server.middlewares.use(handler),
    configurePreviewServer: (server) => void server.middlewares.use(handler),
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "")
  return {
    plugins: [react(), tailwindcss(), gemmaApi(env.GEMINI_API_KEY)],
    // One small app bundle; the default 500 kB warning is noise here.
    build: { chunkSizeWarningLimit: 1000 },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
