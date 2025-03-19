import { addMonthToDate } from '../../../global/dateManager.js'
import pool               from '../../models/db.connect.js'
import services           from '../../services/user.services.js'
import service            from '../../services/twilio.services.js'
import jwt                from 'jsonwebtoken'
import _var               from '../../../global/_var.js'
import moment             from 'moment'
import {
  createSchema,
  deleteSchema,
  connectToClientSchema,
  createTableInSchema
} 
from '../../models/schemas.js'
import {
  generateUniqueInstanceName,
  createInstanceForClient
} 
from '../../services/instance.services.js'

const controller = {}
const bd = pool

controller.getUsers = async (req, res) => {
  try {
    const sql  = `SELECT * FROM cliente ORDER BY nombre ASC`
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
      SELECT 
        c.id, 
        c.identificacion, 
        c.nombre, 
        c.telefono, 
        c.est_financiero, 
        c.instancia, 
        c.suscripcion, 
        c.type_graph,
        TO_CHAR(c.fecha_corte, 'DD/MM/YYYY') AS fecha_corte,
        d.login_user AS usuario_dispositivo, 
        d.clave                             
      FROM cliente c
      LEFT JOIN dispositivo d ON c.id = d.id_cliente
      WHERE c.id = $1
      ORDER BY d.login_user ASC
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
        fecha_corte: user.rows[0].fecha_corte,  
        dispositivos: user.rows.map(row => ({
          login_user: row.usuario_dispositivo,  
          clave: row.clave
        })),
        type_graph: user.rows[0].type_graph
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
      WHERE LOWER(nombre) LIKE '%' || LOWER($1) || '%'
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

    const token        = authHeader.split(' ')[1]
    const decodedToken = jwt.verify(token, _var.TOKEN_KEY)

    const expiraEn     = new Date(decodedToken.expiraEn * 1000)
    const tiempoActual = Date.now()
    const diasRestantes = decodedToken.diasRestantes

    if (expiraEn < tiempoActual) {
      decodedToken.suscripcionActiva = false
      console.log('Token ha expirado. Suscripción inactiva.')

      await services.registrarAuditoria(decodedToken.usuarioId, 'Suscripción expirada', null, {
        motivo: 'Token expirado',
        fechaExpiracion: expiraEn.toISOString()
      })
      
      bd.query(
        'UPDATE cliente SET est_financiero = $1 WHERE id = $2',
        ['Inactivo', decodedToken.usuarioId]
      )
      decodedToken.suscripcionActiva = false
      console.log(decodedToken)
      res.status(401).send({ "message": 'El token ha expirado' })
    } else if (diasRestantes <= 5) {
      res.status(200).send({ "message": `Faltan ${diasRestantes} días para el vencimiento de tu suscripción. Contáctanos` })
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

    const { identificacion, nombre, telefono, type_graph, dispositivos } = req.body
    const instancia = generateUniqueInstanceName(identificacion)

    if (identificacion.length > 12) {
      return res.status(400).json({ "message": "Has superado la cantidad de dígitos de la identificación. No puede tener más de 12 dígitos" })
    }

    const existingIdentificacionQuery  = `SELECT id FROM cliente WHERE identificacion = $1`
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

    const fechaCorte  = `CURRENT_DATE + INTERVAL '35 days'`
    const suscripcion = 35  

    const clienteQuery = `
      INSERT INTO cliente (identificacion, nombre, telefono, instancia, type_graph, fecha_corte, suscripcion)
      VALUES ($1, $2, $3, $4, $5, ${fechaCorte}, $6)
      RETURNING id, identificacion
    `
    const clienteValues         = [identificacion, nombre, telefono, instancia, type_graph, suscripcion]
    const clienteResult         = await client.query(clienteQuery, clienteValues)
    const clienteId             = clienteResult.rows[0].id
    const identificacionCliente = clienteResult.rows[0].identificacion

    if (dispositivos && dispositivos.length > 0) {
      for (const dispositivo of dispositivos) {
        if (!dispositivo.login_user || dispositivo.login_user.trim() === '') {
          return res.status(400).json({ "message": "El campo login_user no puede estar vacío para los dispositivos." })
        }

        const existingDeviceQuery  = `SELECT id FROM dispositivo WHERE login_user = $1`
        const existingDeviceValues = [dispositivo.login_user]
        const existingDeviceResult = await client.query(existingDeviceQuery, existingDeviceValues)

        if (existingDeviceResult.rows.length > 0) {
          return res.status(400).json({ "message": `El usuario ${dispositivo.login_user} ya existe en la lista de usuarios.` })
        }

        const dispositivoQuery = `
          INSERT INTO dispositivo(id_cliente, login_user, clave)
          VALUES($1, $2, $3)
        `
        const dispositivoValues = [clienteId, dispositivo.login_user, dispositivo.clave]
        await client.query(dispositivoQuery, dispositivoValues)
      }
    }

    await createSchema(identificacionCliente)
    createTableInSchema(identificacionCliente, 'ventas')
    createInstanceForClient(clienteId, identificacionCliente, instancia)

    await client.query('COMMIT')
    console.log(identificacion, nombre, telefono, dispositivos)

    res.status(200).send({ "message": 'Cliente registrado correctamente.' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error({ "message": 'Error al registrar cliente:', err })
    res.status(500).send({ "message": 'Error al registrar cliente.' })
  } finally {
    client.release()
  }
}

controller.loginUser = async (req, res) => {
  const { login_user, clave } = req.body
  
  let client
  try {
    client = await pool.connect()

    const dispositivoQuery = `
      SELECT id_cliente, clave 
      FROM dispositivo 
      WHERE login_user = $1
    `
    const dispositivoValues = [login_user]
    const dispositivoResult = await client.query(dispositivoQuery, dispositivoValues)

    if (dispositivoResult.rows.length === 0) return res.status(404).json({ message: "Este usuario no existe." })

    const dispositivoValido = dispositivoResult.rows[0]
    const { id_cliente: userId, clave: claveDispositivo } = dispositivoValido

    if (clave !== claveDispositivo) {
      await services.registrarAuditoria(userId, 'Intento de inicio de sesión fallido', login_user, { claveIntentada: clave })
      
      const intentosQuery    = `SELECT intento FROM cliente WHERE id = $1`
      const intentosResult   = await client.query(intentosQuery, [userId])
      const intentosFallidos = intentosResult.rows[0]?.intento
      
      if (intentosFallidos >= 3) {
        const fechaActual = new Date().toISOString()

        await client.query('INSERT INTO notificacion (id_user, notify_type, id_dispositivo, fecha) VALUES ($1, $2, $3, $4)', [userId, 'Se ha ingresado mal la contraseña más de 3 veces', login_user, fechaActual])

        await client.query('UPDATE cliente SET est_financiero = $1 WHERE id = $2', ['Inactivo', userId])

        return res.status(403).send({ message: 'Intentos fallidos expirados. Comunícate con los administradores' })
      }

      await client.query('UPDATE cliente SET intento = intento + 1 WHERE id = $1', [userId])
      return res.status(401).send({ message: 'Nombre de Usuario o Contraseña Incorrectos. Por favor verifique!' })
    }

    const intentosQuery    = `SELECT intento FROM cliente WHERE id = $1`
    const intentosResult   = await client.query(intentosQuery, [userId])
    const intentosFallidos = intentosResult.rows[0]?.intento

    if (intentosFallidos >= 3) {
      const fechaActual = new Date().toISOString()

      await client.query('INSERT INTO notificacion (id_user, notify_type, id_dispositivo, fecha) VALUES ($1, $2, $3, $4)', [userId, 'Se ha ingresado mal la contraseña más de 3 veces', login_user, fechaActual])

      await client.query('UPDATE cliente SET est_financiero = $1 WHERE id = $2', ['Inactivo', userId])

      return res.status(403).send({ message: 'Intentos fallidos expirados. Comunícate con los administradores' })
    }

    const clienteQuery = `
      SELECT identificacion, nombre, suscripcion, est_financiero, fecha_corte, type_graph
      FROM cliente 
      WHERE id = $1
    `
    const clienteResult = await client.query(clienteQuery, [userId])
    const cliente       = clienteResult.rows[0]

    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" })

    const { identificacion, nombre: nombreCliente, suscripcion: tiempoSuscripcion, est_financiero, fecha_corte, type_graph } = cliente
    console.log({identificacion, nombre: nombreCliente, suscripcion: tiempoSuscripcion, est_financiero, fecha_corte, type_graph})
    
    const fechaActual   = moment().startOf('day')
    const fechaCorte    = moment(fecha_corte).startOf('day')
    const diasRestantes = fechaCorte.diff(fechaActual, 'days')

    // const fechaActual   = moment().tz('America/Caracas').startOf('day');
    // const fechaCorte    = moment(fecha_corte).tz('America/Caracas').startOf('day');
    // const diasRestantes = fechaCorte.diff(fechaActual, 'days');

    console.log(fechaActual)
    console.log(fechaCorte)
    console.log(diasRestantes)

    if (diasRestantes <= 0) {
      const fechaActual = new Date().toISOString()

      await client.query('UPDATE cliente SET est_financiero = $1 WHERE id = $2', ['Inactivo', userId])

      await client.query(`
        INSERT INTO notificacion (id_user, notify_type, id_dispositivo, fecha) 
        VALUES ($1, $2, $3, $4)
      `, [userId, `La suscripción del cliente ${nombreCliente} ha expirado y ha sido marcado como Inactivo.`, login_user, fechaActual])

      return res.status(403).send({ message: 'Su suscripción ha vencido. Por favor realice la renovación. Contáctenos' })
    }

    if (est_financiero === 'Inactivo'){ return res.status(403).send({ message: 'Su suscripción ha vencido. Por favor realice la renovación. Contáctenos' }) }

    if (diasRestantes <= 5) {
      const fechaActual = new Date().toISOString()

      await client.query(`
        INSERT INTO notificacion (id_user, notify_type, id_dispositivo, fecha) 
        VALUES ($1, $2, $3, $4)
      `, [userId, `Al cliente ${nombreCliente} le quedan ${diasRestantes} días de suscripción.`, login_user, fechaActual])

      connectToClientSchema(identificacion, nombreCliente)

      let type_comp

      const companiesQuery = `SELECT COUNT(DISTINCT codemp) as count_codemp FROM ${identificacion}.ventas`
      const companiesResult = await client.query(companiesQuery)
      const countCodemp = companiesResult.rows[0].count_codemp

      if (countCodemp > 1) {
        type_comp = 'Multiple'
      } else {
        type_comp = 'Unico'
      }

      const token = await services.generarToken(userId, true, login_user, tiempoSuscripcion, diasRestantes)
      await services.registrarAuditoria(userId, 'Inicio de sesión exitoso', login_user)
        
      return res.status(200).send({
        tokenCode: token,
        identificacion,
        type_graph,
        type_comp,
        message: `Faltan ${diasRestantes} días para el vencimiento de tu suscripción. Contáctanos`,
        notifyWarning: true
      })
    } else {
      connectToClientSchema(identificacion, nombreCliente)

      let type_comp

      const companiesQuery = `SELECT COUNT(DISTINCT codemp) as count_codemp FROM ${identificacion}.ventas`
      const companiesResult = await client.query(companiesQuery)
      const countCodemp = companiesResult.rows[0].count_codemp

      if (countCodemp > 1) {
        type_comp = 'Multiple'
      } else {
        type_comp = 'Unico'
      }

      const token = await services.generarToken(userId, true, login_user, tiempoSuscripcion)
      await services.registrarAuditoria(userId, 'Inicio de sesión exitoso', login_user)
        
      return res.status(200).send({
        tokenCode: token,
        identificacion,
        type_graph,
        type_comp
      })
    }
  } catch (error) {
    console.error({ message: 'Error en inicio de sesión:', error })
    return res.status(500).send({ message: 'Error en inicio de sesión' })
  } finally {
    if (client) { client.release() }
  }
}

controller.code = async (req, res) => {
  try {
    const { code } = req.body
    const result   = await service.compareVerificationCodes(code)

    if (result.status === 400) {
      return res.status(400).json(result)
    }

    return res.status(200).json({ message: "Código correcto!" })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Error al validar el código" })
  }
}

function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000)
}

const convertirFechaFormato = (fecha) => {
  const [dia, mes, año] = fecha.split('/')
  return `${año}-${mes}-${dia}`
}

controller.updateUser = async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    const { dispositivos, ...edit } = req.body

    console.log(dispositivos, edit)

    await client.query('BEGIN')

    const getUserQuery = `SELECT nombre, telefono, est_financiero, suscripcion, fecha_corte, type_graph FROM cliente WHERE id=$1`
    const currentUser = await client.query(getUserQuery, [id])

    if (currentUser.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Usuario no encontrado.' })
    }

    const updatedUser = {
      nombre:         edit.nombre || currentUser.rows[0].nombre,
      telefono:       edit.telefono || currentUser.rows[0].telefono,
      est_financiero: edit.est_financiero || currentUser.rows[0].est_financiero,
      suscripcion:    edit.suscripcion || currentUser.rows[0].suscripcion,
      fecha_corte:    edit.fecha_corte ? convertirFechaFormato(edit.fecha_corte) : currentUser.rows[0].fecha_corte,
      type_graph:     edit.type_graph || currentUser.rows[0].type_graph
    }

    console.log(updatedUser.type_graph);

    const updateUserQuery = `
      UPDATE cliente 
      SET nombre=$1, telefono=$2, est_financiero=$3, suscripcion=$4, fecha_corte=$5, type_graph=$6
      WHERE id=$7
    `
    await client.query(updateUserQuery, [
      updatedUser.nombre,
      updatedUser.telefono,
      updatedUser.est_financiero,
      updatedUser.suscripcion,
      updatedUser.fecha_corte,
      updatedUser.type_graph, 
      id,
    ])

    if (dispositivos && dispositivos.length > 0) {
      for (const dispositivo of dispositivos) {
        if (dispositivo.login_user && dispositivo.clave) {
          const checkLoginUserQuery = `
            SELECT id_cliente FROM dispositivo WHERE login_user = $1 AND id_cliente != $2
          `
          const existingUser = await client.query(checkLoginUserQuery, [dispositivo.login_user, id])

          if (existingUser.rows.length > 0) {
            const getClienteNameQuery = `
              SELECT nombre FROM cliente WHERE id = $1
            `
            const clienteResult = await client.query(getClienteNameQuery, [existingUser.rows[0].id_cliente])
            const clienteNombre = clienteResult.rows[0].nombre

            await client.query('ROLLBACK')
            return res.status(200).json({ message: `El nombre de usuario '${dispositivo.login_user}' ya existe en el cliente: '${clienteNombre}'.` })
          }

          const insertDispositivosQuery = `
            INSERT INTO dispositivo (id_cliente, login_user, clave)
            VALUES ($1, $2, $3)
            ON CONFLICT (login_user) DO UPDATE SET clave = EXCLUDED.clave
          `
          await client.query(insertDispositivosQuery, [id, dispositivo.login_user, dispositivo.clave])
        }
      }
    }

    await client.query('COMMIT')
    res.status(200).json({ message: 'Datos del usuario y dispositivos actualizados correctamente.' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ message: 'Error al editar los datos del usuario y dispositivos.' })
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

controller.deleteDevice = async (req, res) => {
  try {
    const { login_user } = req.params

    const result = await bd.query('DELETE FROM dispositivo WHERE login_user = $1', [login_user])

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Dispositivo eliminado correctamente' })
    } else {
      res.status(404).json({ message: 'Dispositivo no encontrado' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al eliminar el dispositivo' })
  }
}

controller.renovarFechaCorte = async (req, res) => {
  const { userId, corte } = req.body
  const newDate = addMonthToDate(corte)

  try {
    let query = `UPDATE cliente SET fecha_corte = '${newDate}', est_financiero = 'Activo' WHERE id = ${userId}`
    const r   = await bd.query(query)
    
    if (r.rowCount > 0) res.status(200).json({ status: true, newDate })
    else res.status(404).json({ status: false })
  } catch (err) { console.log(err) }
}

controller.cambiarEstadoInactivo = async (req, res) => {
  try {
    const { id } = req.params
    
    const query = `
      UPDATE cliente
      SET est_financiero = 'Inactivo'
      WHERE id = $1
    `

    const result = await bd.query(query, [id])
    if (result.rowCount === 0) return res.status(404).json({ message: 'Cliente no encontrado' })

    res.status(200).json({ message: 'Estado financiero cambiado a Inactivo correctamente' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al cambiar el estado de Activo a Inactivo del cliente' })
  }
}

export default controller