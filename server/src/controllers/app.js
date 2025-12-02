import express      from 'express'
import cors         from 'cors'
import _var         from '../../global/_var.js'
import userRouter   from '../routes/user.routes.js'
import clientRouter from '../routes/client.routes.js'
import graphRoutes  from '../routes/graph.routes.js'
import pool from '../models/db.connect.js'


const server = express()

const middlewares = () => {
  server.use(express.json())

  server.use(cors([_var.ORIGIN, _var.ORIGIN1]))

  // Healthy check
  server.get('/health', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW() as db_time')

      res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        db: {
          connected: true,
          time: result.rows[0].db_time
        }
      })
    } catch (err) {
      console.error('DB healthcheck failed:', err.message)
      res.status(500).json({
        status: 'error',
        uptime: process.uptime(),
        timestamp: Date.now(),
        db: {
          connected: false,
          error: err.message
        }
      })
    }
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
