import jwt  from 'jsonwebtoken'
import _var from '../../global/_var.js'

const services = {}
let message    = {}

services.generarToken = (userId, tieneSuscripcion, dispositivos, tiempoSuscripcion) => {
  try {
    const tiempoEnSegundos = tiempoSuscripcion * 24 * 60 * 60
    console.log(tiempoEnSegundos)
    const expiraEn = Math.floor(Date.now() / 1000) + tiempoEnSegundos

    const payload = {
      usuarioId: userId,
      expiraEn: expiraEn, 
      suscripcionActiva: tieneSuscripcion,
      dispositivos: dispositivos
    }

    console.log(payload)
    const token = jwt.sign(payload, _var.TOKEN_KEY, { algorithm: 'HS256' })

    // Lógica para manejar suscripciones y dispositivos cuando el token expire
    setTimeout(() => {
      console.log('El token ha expirado, manejar suscripciones y dispositivos')
    }, 24 * 60 * 60 * 1000) // 24 horas en milisegundos

    return token
  } catch (err) {
    console.error(err)
    return (message = {
      status: 500,
      msg: 'Ha ocurrido un error al generar el token',
    })
  }
}

services.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1] 
    if (!token) {
      return res.status(401).send({ message: 'Token no proporcionado' })
    }

    jwt.verify(token, _var.TOKEN_KEY, (err, decodedToken) => {
      if (err) {
        console.error('Error al verificar token:', err)
        return res.status(401).send({ message: 'Token inválido' })
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