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
    //console.log(token)

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
    const token = req.headers.authorization.split(" ")[1]
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

export default services