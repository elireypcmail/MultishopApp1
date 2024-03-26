import getMAC, { isMAC } from 'getmac'
import pool     from '../../models/db.connect.js'
import services from '../../services/user.services.js'
import jwt from 'jsonwebtoken'
import _var from '../../../global/_var.js'

const controller = {}
const bd = pool

controller.getUsers = async (req, res) => {
  try {
    const sql  = `SELECT * FROM cliente;`
    const user = await bd.query(sql)

    if (user?.rows.length > 0) res.status(200).json({ 
      "message": 'Usuarios cargados correctamente', 
      data: user.rows 
    })
    else res.status(404).json({ "message": 'No hay usuarios registrados' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": 'Error al traer los datos'})
  }
}

controller.getUser = async (req, res) => {
  try {
    const { id } = req.params

    const sql  = `SELECT * FROM cliente WHERE id=$1`
    const user = await pool.query(sql, [ id ])
    if (user?.rows.length == 0) res.status(404).json({ "message": 'Usuario no encontrado' }) 
    else res.status(200).json({ "message": 'Usuario encontrado', data: user?.rows[0] }) 
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": 'Error al traer los datos del usuario' })
  }
}

controller.getClientesInactivos = async (req, res) => {
  try {
    const queryResult = await pool.query(`SELECT * FROM cliente WHERE est_financiero = 'Inactivo'`)
    
    if (queryResult.rows.length > 0) {
      res.status(200).json({ clientes: queryResult.rows })
    } else {
      res.status(404).json({ message: 'No se encontraron clientes inactivos' })
    }
  } catch (error) {
    console.error('Error al obtener clientes inactivos:', error)
    res.status(500).json({ message: 'Error al obtener clientes inactivos' })
  }
};

controller.checkToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).send({ "message": 'Token no proporcionado' })
    }
    
    const token = authHeader.split(' ')[1]
    const decodedToken = jwt.verify(token, _var.TOKEN_KEY)

    const currentTime = Math.floor(Date.now() / 1000);
    let timeRemaining = decodedToken.expiraEn - currentTime;

    if (timeRemaining > 0) {
      const intervalId = setInterval(() => {
        timeRemaining = decodedToken.expiraEn - Math.floor(Date.now() / 1000)
        if (timeRemaining <= 0) {
          clearInterval(intervalId)
          decodedToken.suscripcionActiva = false
          console.log('Token ha expirado. Suscripción inactiva.')
          return
        }
        const remainingTimeFormatted = services.formatTime(timeRemaining)
        console.log("Tiempo restante del token: " + remainingTimeFormatted)
      }, 60000)
      res.status(200).send({ "message": 'Suscripción activa' })
    } else {
      bd.query(
        'UPDATE cliente SET est_financiero = $1 WHERE id = $2',
        ['Inactivo', decodedToken.usuarioId]
      )
      decodedToken.suscripcionActiva = false
      res.status(401).send({ "message": 'El token ha expirado' })
    }
  } catch (err) {
    console.error('Error al verificar token:', err)
    res.status(500).send({ "message": 'Error al verificar token' })
  }
}

controller.postUser = async (req, res) => {
  const client = await bd.connect()

  try {
    await client.query('BEGIN') 

    const { identificacion, nombre, telefono, dispositivos, per_contacto, clave, instancia, suscripcion } = req.body

    const clienteQuery = `
      INSERT INTO cliente (identificacion, nombre, telefono, per_contacto, clave, instancia, suscripcion)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;`
    const clienteValues = [ identificacion, nombre, telefono, per_contacto, clave, instancia, suscripcion ]
    const clienteResult = await client.query(clienteQuery, clienteValues)
    const clienteId = clienteResult.rows[0].id

    // Insertar datos de dispositivos asociados al cliente
    for (const dispositivo of dispositivos) {
      const dispositivoQuery = `
        INSERT INTO dispositivo(id_cliente, telefono, mac, rol, clave)
        VALUES($1, $2, $3, $4, $5)`
      const dispositivoValues = [ clienteId, dispositivo.telefono, dispositivo.mac, dispositivo.rol, dispositivo.clave ]
      await client.query(dispositivoQuery, dispositivoValues)
    }

    await client.query('COMMIT') // Confirmar la transacción
    res.status(200).send({ "message": 'Cliente y dispositivos registrados correctamente.'})
  } catch (err) {
    await client.query('ROLLBACK') // Revertir la transacción en caso de error
    console.error({ "message": 'Error al registrar cliente y dispositivos:', err })
    res.status(500).send({ "message": 'Error al registrar cliente y dispositivos.'})
  } finally {
    client.release() 
  }
}

controller.loginUser = async (req, res) => {
  const { identificacion, clave } = req.body
  const macAddress = getMAC()

  try {
    const client = await pool.connect()

    const usuarioQuery = `
      SELECT id, suscripcion, est_financiero FROM cliente
      WHERE identificacion = $1
    `
    const usuarioValues = [identificacion]
    const usuarioResult = await client.query(usuarioQuery, usuarioValues)
    const { id: userId, suscripcion: tiempoSuscripcion, est_financiero: est_financiero } = usuarioResult.rows[0]

    const dispositivosQuery = `
      SELECT mac, rol, clave FROM dispositivo
      WHERE id_cliente = $1
    `
    const dispositivosValues = [userId]
    const dispositivosResult = await client.query(dispositivosQuery, dispositivosValues)
    const dispositivos = dispositivosResult.rows
    const userRol = dispositivosResult.rows[0].rol

    const dispositivoValido = dispositivos.find(dispositivo => dispositivo.mac === macAddress)

    if (!dispositivoValido) {
      return res.status(403).json({"message": "No puede ingresar con este dispositivo"})
    }

    if (clave !== dispositivoValido.clave) {
      return res.status(403).send({ "message": 'Contraseña incorrecta' })
    }

    if (est_financiero === 'Inactivo') {
      return res.status(403).send({ "message": 'Suscripción expirada. Comunícate con los administradores' })
    }

    const token = services.generarToken(userId, true, dispositivos, tiempoSuscripcion)
    await bd.query(
      'INSERT INTO suscripcion (idUser, token) VALUES ($1, $2)',
      [userId, token]
    )
    res.status(200).send({ token })

    client.release() // Liberar el cliente de la pool
  } catch (error) {
    console.error({ "message": 'Error en inicio de sesión:', error })
    res.status(500).send({ "message": 'Error en inicio de sesión' })
  }
}

controller.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const edit = req.body

    const sql = `UPDATE cliente 
                 SET nombre=$1, 
                     telefono=$2, 
                     per_contacto=$3, 
                     est_financiero=$4, 
                     clave=$5 
                 WHERE id=$6`

    const user = await bd.query(sql, [
      edit?.nombre,
      edit?.telefono,
      edit?.per_contacto,
      edit?.est_financiero, 
      edit?.clave,
      id
    ])

    if (user.rowCount == 1) {
      res.status(200).json({ "message": 'Datos del usuario editados correctamente' })
    } else {
      res.status(404).json({ "message": 'El usuario no existe' })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": 'Error al editar los datos de este usuario' })
  }
}

controller.deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const sql  = `DELETE FROM cliente WHERE id =$1`
    await bd.query(sql, [ id ])
    res.status(200).json({ "message": 'Se ha eliminado el usuario correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": 'Error al eliminar este usuario' })
  }
}

export default controller