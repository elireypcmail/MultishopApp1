import jwt  from 'jsonwebtoken'
import pool from '../models/db.connect.js'
import _var from '../../global/_var.js'

const services = {}
let message    = {}

services.generarToken = async (userId, tieneSuscripcion, dispositivo, tiempoSuscripcionEnDias) => {
  try {
    const tiempoEnMilisegundos = tiempoSuscripcionEnDias * 24 * 60 * 60 * 1000
    const expiraEn = Date.now() + tiempoEnMilisegundos

    const payload = {
      usuarioId: userId,
      expiraEn: expiraEn,
      suscripcionActiva: tieneSuscripcion,
      dispositivo: dispositivo,
    }

    const token = jwt.sign(payload, _var.TOKEN_KEY, { algorithm: 'HS256' })

    await services.almacenarToken(userId, token)

    return token
  } catch (err) {
    console.error(err)
    return {
      status: 500,
      msg: 'Ha ocurrido un error al generar el token',
    }
  }
}

services.almacenarToken = async (userId, token) => {
  try {
    const db = await pool.connect()

    await db.query( 'INSERT INTO suscripcion (idUser, token) VALUES ($1, $2)', [userId, token] )

    db.release()
  } catch (err) {
    console.error('Error al almacenar token:', err)
  }
}

services.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).send({ message: 'Token no proporcionado' })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).send({ message: 'Token no proporcionado' })
    }

    const startBackgroundProcess = (expireEn) => {
      const intervalId = setInterval(() => {
        const currentTime = Date.now()
        const remainingTime = expireEn - currentTime
        const remainingDays = Math.floor(remainingTime / (1000 * 60 * 60 * 24))

        console.log(`Faltan ${remainingDays} días de suscripción`)
      }, 60000)

      return intervalId
    }

    jwt.verify(token, _var.TOKEN_KEY, (err, decodedToken) => {
      if (err) {
        console.error('Error al verificar token:', err)
        return res.status(401).send({ message: 'Token inválido' })
      }

      const expireEn = decodedToken.expiraEn
      const expireDate = new Date(expireEn * 1000)
      const tiempoActual = Date.now()

      const intervalId = startBackgroundProcess(expireDate)

      if (expireDate < tiempoActual) {
        console.log('Token ha expirado')
        return res.status(401).send({ message: 'El token ha expirado' })
      }

      console.log('TOKEN DECODIFICADO:', decodedToken)
      req.userData = { userId: decodedToken.usuarioId }
      next()
    })
  } catch (error) {
    console.error('Error al verificar token:', error)
    return res.status(500).send({ message: 'Error al verificar token' })
  }
}

services.formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  return formattedTime
}

services.registrarAuditoria = async (id_usuario, accion, id_dispositivo = null, additional_info = null) => {
  const client = await pool.connect()
  try {
    const query = `
      INSERT INTO auditoria (id_usuario, accion, id_dispositivo, additional_info)
      VALUES ($1, $2, $3, $4)
    `
    const values = [id_usuario, accion, id_dispositivo, additional_info]
    await client.query(query, values)
  } catch (error) {
    console.error('Error al registrar auditoría:', error)
  } finally {
    client.release()
  }
}

services.getAuditoria = async (req, res) => {
  const { id } = req.params
  
  try {
    const query = `
      SELECT * FROM auditoria
      WHERE id_usuario = $1
      ORDER BY fecha DESC
    `
    const values = [id]
    const result = await pool.query(query, values)

    res.status(200).json({ "message": "Auditoría cargada correctamente", "data": result.rows })
  } catch (error) {
    console.error('Error al obtener registros de auditoría:', error)
    res.status(500).json({ "message": 'Error al obtener registros de auditoría' })
  }
}

services.getAuditoriaDate = async (req, res) => {
  try {
    const { id, inicio, fin } = req.body
    const client = await pool.connect()

    const movimientosQuery = `
      SELECT * FROM auditoria
      WHERE id_usuario = $1
      AND fecha BETWEEN $2 AND $3
      ORDER BY fecha DESC
    `
    const movimientosValue = [ id, inicio, fin ]
    const movimientosResult = await client.query(movimientosQuery, movimientosValue)
    const movimientos = movimientosResult.rows

    if (movimientos.length === 0) {
      return  res.status(404).json({ "message": "No se encontraron movimientos con esa fecha."})
    }

    res.status(200).json({ "userId": id, "data": movimientos })

    client.release()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "error": "Error al buscar movimientos por fecha" })
  }
}

services.getAuditoriaPromedio = async (req, res) => {
  const { start, end } = req.body

  try {
    const client = await pool.connect()

    const query = `
      SELECT AVG(valor_up) AS average
      FROM "adriana guerra".ventas
      WHERE fecha BETWEEN $1 AND $2
    `

    const values = [start, end]
    const result = await client.query(query, values)

    if (result.rows.length === 0 || result.rows[0].average === null) {
      return res.status(404).json({ message: 'No hay datos disponibles para las fechas proporcionadas.' })
    }
    
    res.json({ average: result.rows[0].average })

    client.release()
  } catch (error) {
    console.error("Error executing query:", error)
    res.status(500).json({ error: "Error fetching monthly average" })
  }
}

export default services