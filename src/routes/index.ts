import type { Express } from "express"
import { userRouter } from "./users/index.js"

const baseRoute = '/api/v1'

const router = (app: Express) => {
  app.use(`${baseRoute}/users`, userRouter)
}

export default router
