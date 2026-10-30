import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Connect, type Plugin } from "vite"
import { createApiHandler } from "./server/api"

// The Gemini key is only read here, on the server. It never reaches browser code.
function gemmaApi(apiKey: string | undefined): Plugin {
  const handle = createApiHandler(apiKey)

  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    if (!req.url?.startsWith("/api/")) {
      next()
      return
    }
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(chunk as Buffer)
    const request = new Request(new URL(req.url, "http://localhost"), {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
    })
    const response = await handle(request)
    res.statusCode = response.status
    response.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(Buffer.from(await response.arrayBuffer()))
  }

  return {
    name: "gemma-api",
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
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
