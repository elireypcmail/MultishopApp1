import jwt  from 'jsonwebtoken'
import _var from '../../global/_var.js'

const services = {}
let message    = {}

services.generarToken = (userId) => {
  try {
    const payload = {
      usuarioId: userId,
      expiraEn: Math.floor(Date.now() / 1000) + (5 * 60)
    }

    console.log(payload)
    const token = jwt.sign(payload, _var.TOKEN_KEY, { algorithm: 'HS256' })
    
    return token
  } catch (err) {
    console.error(err)
    return message = {
      status: 500,
      msg: 'Ha ocurrido un error al generar el token'
    }
  }
}

export default services