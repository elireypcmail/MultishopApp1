import {
  createSchema,
  deleteSchema,
  connectToClientSchema,
  createTableInSchema
} from '../../models/schemas.js'
import {
  generateUniqueInstanceName,
  createInstanceForClient
} from '../../services/instance.services.js'
import getMAC from 'getmac'
import pool from '../../models/db.connect.js'
import services from '../../services/user.services.js'
import service from '../../services/twilio.services.js'
import jwt from 'jsonwebtoken'
import _var from '../../../global/_var.js'

const controller = {}
const bd = pool

controller.getUsers = async (req, res) => {
  try {
    const sql = `SELECT id, identificacion, nombre, est_financiero FROM cliente;`
    const user = await bd.query(sql)

    if (user?.rows.length > 0) res.status(200).json({
      "message": 'Usuarios cargados correctamente',
      data: user.rows
    })
    else res.status(404).json({ "message": 'No hay usuarios registrados' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": 'Error al traer los datos' })
  }
}

controller.getUser = async (req, res) => {
  try {
    const { id } = req.params
    const sql = `
      SELECT c.id, c.identificacion, c.nombre, c.telefono, c.est_financiero, c.instancia, c.suscripcion,
             d.telefono AS telefono_dispositivo, d.rol, d.clave
      FROM cliente c
      LEFT JOIN dispositivo d ON c.id = d.id_cliente
      WHERE c.id = $1
    `

    const user = await pool.query(sql, [id])
    if (user?.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    } else {
      const userData = {
        id: user.rows[0].id,
        identificacion: user.rows[0].identificacion,
        nombre: user.rows[0].nombre,
        telefono: user.rows[0].telefono,
        est_financiero: user.rows[0].est_financiero,
        instancia: user.rows[0].instancia,
        suscripcion: user.rows[0].suscripcion,
        dispositivos: user.rows.map(row => ({
          telefono: row.telefono_dispositivo,
          rol: row.rol,
          clave: row.clave
        }))
      }

      return res.status(200).json({ message: 'Usuario encontrado', data: userData })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error al traer los datos del usuario' })
  }
}

controller.filtrarClientesPorLetra = async (req, res) => {
  try {
    const { letra } = req.body

    const client = await pool.connect()
    const query = `
      SELECT * FROM cliente
      WHERE LOWER(nombre) LIKE '%' || LOWER($1) || '%';
    `
    const result = await client.query(query, [letra])

    client.release()

    res.status(200).json({ "message": "Se encontraron coincidencias", "data": result.rows })
  } catch (error) {
    console.error('Error al filtrar clientes:', error)
    res.status(500).json({ message: 'Error al filtrar clientes' })
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
}

controller.checkToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).send({ "message": 'Token no proporcionado' })
    }

    const token = authHeader.split(' ')[1]
    const decodedToken = jwt.verify(token, _var.TOKEN_KEY)

    const expiraEn = new Date(decodedToken.expiraEn * 1000) // Convertir el timestamp a una fecha real
    const tiempoActual = Date.now()

    if (expiraEn < tiempoActual) {
      decodedToken.suscripcionActiva = false
      console.log('Token ha expirado. Suscripción inactiva.')
      bd.query(
        'UPDATE cliente SET est_financiero = $1 WHERE id = $2',
        ['Inactivo', decodedToken.usuarioId]
      )
      decodedToken.suscripcionActiva = false
      console.log(decodedToken)
      res.status(401).send({ "message": 'El token ha expirado' })
    } else {
      res.status(200).send({ "message": 'Suscripción activa' })
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

    const { identificacion, nombre, telefono, dispositivos } = req.body

    const instancia = generateUniqueInstanceName(nombre)

    if (identificacion.length > 12) {
      return res.status(400).json({ "message": "Has superado la cantidad de dígitos de la identificación. No puede tener más de 12 digitos" })
    }

    const existingIdentificacionQuery = `SELECT id FROM cliente WHERE identificacion = $1`
    const existingIdentificacionValues = [identificacion]
    const existingIdentificacionResult = await client.query(existingIdentificacionQuery, existingIdentificacionValues)

    if (existingIdentificacionResult.rows.length > 0) {
      return res.status(400).json({ "message": "Esta identificación ya existe." })
    }

    const existingTelefonoQuery = `SELECT id FROM cliente WHERE telefono = $1`
    const existingTelefonoValues = [telefono]
    const existingTelefonoResult = await client.query(existingTelefonoQuery, existingTelefonoValues)

    if (existingTelefonoResult.rows.length > 0) {
      return res.status(400).json({ "message": "Este número de teléfono ya existe." })
    }

    const existingNombreQuery = `SELECT id FROM cliente WHERE nombre = $1`
    const existingNombreValues = [nombre]
    const existingNombreResult = await client.query(existingNombreQuery, existingNombreValues)

    if (existingNombreResult.rows.length > 0) {
      return res.status(400).json({ "message": "Este nombre de cliente ya existe." })
    }

    const existsClientQuery = `
      SELECT id FROM cliente WHERE identificacion = $1 AND nombre = $2 AND telefono = $3
    `
    const existsClientValues = [identificacion, nombre, telefono]
    const existsClientResult = await client.query(existsClientQuery, existsClientValues)

    if (existsClientResult.rows.length > 0) {
      return res.status(400).json({ "message": 'El cliente ya existe.' })
    }

    const clienteQuery = `
      INSERT INTO cliente (identificacion, nombre, telefono, instancia)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre
    `
    const clienteValues = [identificacion, nombre, telefono, instancia]
    const clienteResult = await client.query(clienteQuery, clienteValues)
    const clienteId = clienteResult.rows[0].id
    const nombreCliente = clienteResult.rows[0].nombre

    const dispositivosValidados = dispositivos.filter(dispositivo => ['rol1', 'rol2', 'rol3'].includes(dispositivo.rol))
    for (const dispositivo of dispositivosValidados) {
      const existingDeviceQuery = `SELECT id FROM dispositivo WHERE telefono = $1`
      const existingDeviceValues = [dispositivo.telefono]
      const existingDeviceResult = await client.query(existingDeviceQuery, existingDeviceValues)

      if (existingDeviceResult.rows.length > 0) {
        return res.status(400).json({ "message": "Este número de teléfono ya existe en los dispositivos." })
      }

      const dispositivoQuery = `
        INSERT INTO dispositivo(id_cliente, telefono, rol, clave)
        VALUES($1, $2, $3, $4);
      `
      const dispositivoValues = [clienteId, dispositivo.telefono, dispositivo.rol, dispositivo.clave]
      await client.query(dispositivoQuery, dispositivoValues)
    }

    await createSchema(nombreCliente)
    createTableInSchema(nombreCliente, 'ventas')
    createInstanceForClient(clienteId, nombreCliente, instancia)

    await client.query('COMMIT') // Confirmar la transacción
    res.status(200).send({ "message": 'Cliente y dispositivos registrados correctamente.' })
  } catch (err) {
    await client.query('ROLLBACK') // Revertir la transacción en caso de error
    console.error({ "message": 'Error al registrar cliente y dispositivos:', err })
    res.status(500).send({ "message": 'Error al registrar cliente y dispositivos.' })
  } finally {
    client.release()
  }
}

controller.loginUser = async (req, res) => {
  const { identificacion, instancia, telefono, clave } = req.body

  try {
    const client = await pool.connect()

    const usuarioQuery = `
      SELECT id, nombre, suscripcion, est_financiero, intento
      FROM cliente
      WHERE identificacion = $1
    `
    const usuarioValues = [identificacion]
    const usuarioResult = await client.query(usuarioQuery, usuarioValues)
    const {
      id: userId,
      nombre: nombreCliente,
      suscripcion: tiempoSuscripcion,
      est_financiero: est_financiero,
      intento: intentosFallidos
    } = usuarioResult.rows[0]

    const dispositivosQuery = `
      SELECT telefono, rol, clave FROM dispositivo
      WHERE id_cliente = $1 
    `
    const dispositivosValues = [userId]
    const dispositivosResult = await client.query(dispositivosQuery, dispositivosValues)
    const dispositivoValido = dispositivosResult.rows[0]

    const existingDeviceQuery = `SELECT id FROM dispositivo WHERE telefono = $1`
    const existingDeviceValues = [telefono]
    const existingDeviceResult = await client.query(existingDeviceQuery, existingDeviceValues)

    if (existingDeviceResult.rows.length !== 1) {
      return res.status(400).json({ "message": "Este número de teléfono no existe." })
    }

    const auth = service.verificarNumeroTelefono(telefono)

    const verificationCode = generateVerificationCode()
    await service.sendVerificationCode(telefono, verificationCode)

    if (clave !== dispositivoValido.clave) {
      if (intentosFallidos >= 3) {
        await client.query('INSERT INTO notificacion (id_user, notify_type, id_dispositivo) VALUES ($1, $2, $3)',
          [userId, 'Se ha ingresado mal la contraseña más de 3 veces', dispositivoValido.telefono]
        )
        return res.status(403).send({ "message": 'Intentos fallidos expirados. Comunícate con los administradores' })
      }

      await client.query('UPDATE cliente SET intento = intento + 1 WHERE id = $1', [userId])
      return res.status(403).send({ "message": 'Contraseña incorrecta' })
    }

    if (est_financiero === 'Inactivo') {
      return res.status(403).send({ "message": 'Suscripción expirada. Comunícate con los administradores' })
    }

    connectToClientSchema(identificacion, instancia)
    const token = services.generarToken(userId, true, dispositivoValido.mac, tiempoSuscripcion)

    const tokenUser = await token

    client.release()
    service.saveVerification(userId, telefono, verificationCode)

    return res.status(200).json({ "message": "Por favor, ingresa el código de verificación enviado a tu teléfono.", "token": tokenUser })
  } catch (error) {
    console.error({ "message": 'Error en inicio de sesión:', error })
    res.status(500).send({ "message": 'Error en inicio de sesión' })
  }
}

controller.code = async (req, res) => {
  try {
    const { code } = req.body
    const result = await service.compareVerificationCode(code)

    if (result.status == 400) { return res.status(400).json(result) }

    return res.status(200).json(result)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ "message": "Error al validar el código" })
  }
}

function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000)
}

controller.updateUser = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    const { dispositivos, ...edit } = req.body

    await client.query('BEGIN')

    const updateUserQuery = `
      UPDATE cliente 
      SET nombre=$1, telefono=$2, est_financiero=$3, suscripcion=$4
      WHERE id=$5
    `
    const updateUserValues = [
      edit.nombre,
      edit.telefono,
      edit.est_financiero,
      edit.suscripcion,
      id
    ]
    await client.query(updateUserQuery, updateUserValues)

    const deleteDispositivosQuery = `
      DELETE FROM dispositivo
      WHERE id_cliente=$1
    `
    await client.query(deleteDispositivosQuery, [id])

    const insertDispositivosQuery = `
      INSERT INTO dispositivo (id_cliente, telefono, rol, clave)
      VALUES ($1, $2, $3, $4)
    `
    for (const dispositivo of dispositivos) {
      const insertDispositivoValues = [
        id,
        dispositivo.telefono,
        dispositivo.rol,
        dispositivo.clave
      ]
      await client.query(insertDispositivosQuery, insertDispositivoValues)
    }

    await client.query('COMMIT')
    res.status(200).json({ message: 'Datos del usuario y dispositivos actualizados correctamente' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ message: 'Error al editar los datos de este usuario y dispositivos' })
  } finally {
    client.release()
  }
}

controller.deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    await bd.query(`DELETE FROM instancia WHERE id_cliente = $1`, [id])
    await bd.query('DELETE FROM suscripcion WHERE idUser = $1', [id])
    await bd.query('DELETE FROM dispositivo WHERE id_cliente = $1', [id])

    await deleteSchema(id)

    const sql = `DELETE FROM cliente WHERE id =$1`
    await bd.query(sql, [id])

    res.status(200).json({ "message": 'Se ha eliminado el usuario correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": 'Error al eliminar este usuario' })
  }
}

export default controller