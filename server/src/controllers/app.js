import express      from "express"
import cors         from  'cors'
import _var         from "../../global/_var.js"
import userRouter   from '../routes/user.routes.js'
import clientRouter from "../routes/client.routes.js"

const server = express()

const middlewares = () => {
  server.use(express.json())
  server.use(cors(_var.ORIGIN))
  server.use(userRouter)
  server.use(clientRouter)
}

const app = () => {
  middlewares()
  return server
}

export default app