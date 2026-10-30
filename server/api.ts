import { MAX_UPLOAD_BYTES, UserError, createGemma } from "./gemma"

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

const readJson = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new UserError(400, "Request body wasn't JSON.")
  })

// One handler for both the Vite dev server (vite.config.ts) and Netlify (netlify/functions/api.mts).
export function createApiHandler(apiKey: string | undefined) {
  const gemma = createGemma(apiKey)

  return async (request: Request): Promise<Response> => {
    const { pathname } = new URL(request.url)
    try {
      if (request.method !== "POST") throw new UserError(405, "Use POST.")
      if (pathname === "/api/analyse") {
        if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES) {
          throw new UserError(
            413,
            "That video is too big to send. Try a shorter clip."
          )
        }
        const video = new Uint8Array(await request.arrayBuffer())
        const items = await gemma.analyseVideo(
          video,
          request.headers.get("content-type") ?? ""
        )
        return json(200, { items })
      }
      if (pathname === "/api/analyse-photos") {
        if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES) {
          throw new UserError(
            413,
            "Those photos are too big to send. Try fewer photos."
          )
        }
        return json(200, {
          items: await gemma.analysePhotos(await readJson(request)),
        })
      }
      if (pathname === "/api/plan") {
        return json(200, {
          summary: await gemma.writePlanSummary(await readJson(request)),
        })
      }
      return json(404, { error: "Unknown API route." })
    } catch (error) {
      if (error instanceof UserError)
        return json(error.status, { error: error.message })
      console.error("[api]", error)
      return json(500, {
        error: "Something went wrong on our side. Please try again.",
      })
    }
  }
}
