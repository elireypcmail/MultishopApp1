import express    from "express"
import userRouter from '../routes/user.routes.js'

const server = express()

const middlewares = () => {
  server.use(express.json())
  server.use(userRouter)
}

const app = () => {
  middlewares()
  return server
}

export default app