import express      from 'express'
import cors         from 'cors'
import _var         from '../../global/_var.js'
import userRouter   from '../routes/user.routes.js'
import clientRouter from '../routes/client.routes.js'
import graphRoutes  from '../routes/graph.routes.js'

const server = express()

const middlewares = () => {
  server.use(express.json())

  server.use(cors({
    origin: [_var.ORIGIN, _var.ORIGIN1],
    credentials: true
  }))

  // Healthy check
  server.get('/', (req, res) => {
    res.status(200).json({ success: true, status:"ok", message: 'API Multishop online' })
  })

  // Rutas
  server.use(userRouter)
  server.use(clientRouter)
  server.use(graphRoutes)

  // Manejo de errores genérico
  server.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Error interno del servidor')
  })

  // Manejo de errores 404
  server.use((req, res, next) => {
    res.status(404).send('Recurso no encontrado')
  })
}

const app = () => {
  middlewares()
  return server
}

export default app
