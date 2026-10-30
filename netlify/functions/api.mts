import { createApiHandler } from "../../server/api"

const handle = createApiHandler(process.env.GEMINI_API_KEY)

export default (request: Request) => handle(request)

export const config = { path: "/api/*" }
