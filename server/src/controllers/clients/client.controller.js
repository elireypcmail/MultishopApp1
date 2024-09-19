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
import pool     from '../../models/db.connect.js'
import services from '../../services/user.services.js'
import service  from '../../services/twilio.services.js'
import jwt      from 'jsonwebtoken'
import _var     from '../../../global/_var.js'

const controller = {}
const bd = pool

controller.getUsers = async (req, res) => {
  try {
    const sql = `SELECT id, identificacion, nombre, est_financiero FROM cliente`
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
        c.id, c.identificacion, c.nombre, c.telefono, c.est_financiero, c.instancia, c.suscripcion,
        d.login_user AS usuario_dispositivo, d.clave                             
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
          login_user: row.usuario_dispositivo,  
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

    const token = authHeader.split(' ')[1]
    const decodedToken = jwt.verify(token, _var.TOKEN_KEY)

    const expiraEn = new Date(decodedToken.expiraEn * 1000) // Convertir el timestamp a una fecha real
    const tiempoActual = Date.now()

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

    // Crear la instancia basada en la identificación
    const instancia = generateUniqueInstanceName(identificacion)

    // Validar que la identificación no supere los 12 dígitos
    if (identificacion.length > 12) {
      return res.status(400).json({ "message": "Has superado la cantidad de dígitos de la identificación. No puede tener más de 12 dígitos" })
    }

    // Verificar si ya existe un cliente con la misma identificación
    const existingIdentificacionQuery = `SELECT id FROM cliente WHERE identificacion = $1`
    const existingIdentificacionValues = [identificacion]
    const existingIdentificacionResult = await client.query(existingIdentificacionQuery, existingIdentificacionValues)

    if (existingIdentificacionResult.rows.length > 0) {
      return res.status(400).json({ "message": "Esta identificación ya existe." })
    }

    // Verificar si ya existe un cliente con el mismo número de teléfono
    const existingTelefonoQuery = `SELECT id FROM cliente WHERE telefono = $1`
    const existingTelefonoValues = [telefono]
    const existingTelefonoResult = await client.query(existingTelefonoQuery, existingTelefonoValues)

    if (existingTelefonoResult.rows.length > 0) {
      return res.status(400).json({ "message": "Este número de teléfono ya existe." })
    }

    // Insertar cliente en la base de datos
    const clienteQuery = `
      INSERT INTO cliente (identificacion, nombre, telefono, instancia)
      VALUES ($1, $2, $3, $4)
      RETURNING id, identificacion
    `
    const clienteValues = [identificacion, nombre, telefono, instancia]
    const clienteResult = await client.query(clienteQuery, clienteValues)
    const clienteId = clienteResult.rows[0].id
    const identificacionCliente = clienteResult.rows[0].identificacion

    // Verificar e insertar los dispositivos si existen
    if (dispositivos && dispositivos.length > 0) {
      for (const dispositivo of dispositivos) {
        if (!dispositivo.login_user || dispositivo.login_user.trim() === '') {
          return res.status(400).json({ "message": "El campo login_user no puede estar vacío para los dispositivos." })
        }

        // Verificar si el dispositivo con ese login_user ya existe
        const existingDeviceQuery = `SELECT id FROM dispositivo WHERE login_user = $1`
        const existingDeviceValues = [dispositivo.login_user]
        const existingDeviceResult = await client.query(existingDeviceQuery, existingDeviceValues)

        if (existingDeviceResult.rows.length > 0) {
          return res.status(400).json({ "message": `El usuario ${dispositivo.login_user} ya existe en la lista de usuarios.` })
        }

        // Insertar el dispositivo en la base de datos
        const dispositivoQuery = `
          INSERT INTO dispositivo(id_cliente, login_user, clave)
          VALUES($1, $2, $3)
        `
        const dispositivoValues = [clienteId, dispositivo.login_user, dispositivo.clave]
        await client.query(dispositivoQuery, dispositivoValues)
      }
    }

    // Crear el esquema basado en la identificación del cliente
    await createSchema(identificacionCliente)

    // Crear la tabla 'ventas' dentro del esquema del cliente
    createTableInSchema(identificacionCliente, 'ventas')

    // Crear la instancia para el cliente con los datos necesarios
    createInstanceForClient(clienteId, identificacionCliente, instancia)

    // Confirmar la transacción
    await client.query('COMMIT')
    console.log(identificacion, nombre, telefono, dispositivos)

    // Responder con éxito
    res.status(200).send({ "message": 'Cliente y dispositivos registrados correctamente.' })
  } catch (err) {
    // Revertir la transacción en caso de error
    await client.query('ROLLBACK')
    console.error({ "message": 'Error al registrar cliente y dispositivos:', err })
    res.status(500).send({ "message": 'Error al registrar cliente y dispositivos.' })
  } finally {
    // Liberar el cliente de la conexión
    client.release()
  }
}

controller.loginUser = async (req, res) => {
  const { login_user, clave } = req.body 

  try {
    const client = await pool.connect()

    const dispositivoQuery = `
      SELECT id_cliente, clave 
      FROM dispositivo 
      WHERE login_user = $1
    `
    const dispositivoValues = [login_user]
    const dispositivoResult = await client.query(dispositivoQuery, dispositivoValues)

    if (dispositivoResult.rows.length === 0) {
      return res.status(200).json({ message: "Este usuario no existe." })
    }

    const dispositivoValido = dispositivoResult.rows[0]
    const { id_cliente: userId, clave: claveDispositivo } = dispositivoValido

    if (clave !== claveDispositivo) {
      await services.registrarAuditoria(userId, 'Intento de inicio de sesión fallido', login_user, { claveIntentada: clave })

      const intentosQuery = `SELECT intento FROM cliente WHERE id = $1`
      const intentosResult = await client.query(intentosQuery, [userId])
      const intentosFallidos = intentosResult.rows[0]?.intento

      if (intentosFallidos >= 2) {
        await client.query('INSERT INTO notificacion (id_user, notify_type, id_dispositivo) VALUES ($1, $2, $3)', [userId, 'Se ha ingresado mal la contraseña más de 3 veces', login_user])
        return res.status(200).send({ message: 'Intentos fallidos expirados. Comunícate con los administradores' })
      }

      await client.query('UPDATE cliente SET intento = intento + 1 WHERE id = $1', [userId])
      return res.status(200).send({ message: 'Contraseña incorrecta' })
    }

    const clienteQuery = `
      SELECT identificacion, nombre, suscripcion, est_financiero 
      FROM cliente 
      WHERE id = $1
    `
    const clienteResult = await client.query(clienteQuery, [userId])
    const cliente = clienteResult.rows[0]

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" })
    }

    const { identificacion, nombre: nombreCliente, suscripcion: tiempoSuscripcion, est_financiero } = cliente

    if (est_financiero === 'Inactivo') {
      return res.status(200).send({ message: 'Suscripción expirada. Comunícate con los administradores' })
    }

    connectToClientSchema(identificacion, nombreCliente)

    const token = await services.generarToken(userId, true, login_user, tiempoSuscripcion)

    await services.registrarAuditoria(userId, 'Inicio de sesión exitoso', login_user)

    client.release()

    return res.status(200).json({ tokenCode: token, identificacion })
  } catch (error) {
    console.error({ message: 'Error en inicio de sesión:', error })
    res.status(500).send({ message: 'Error en inicio de sesión' })
  }
}

controller.code = async (req, res) => {
  try {
    const { code } = req.body
    const result = await service.compareVerificationCodes(code)

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

controller.updateUser = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { dispositivos, ...edit } = req.body;

    await client.query('BEGIN');

    // Actualizar datos del usuario
    const getUserQuery = `SELECT nombre, telefono, est_financiero, suscripcion FROM cliente WHERE id=$1`;
    const currentUser = await client.query(getUserQuery, [id]);

    if (currentUser.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const updatedUser = {
      nombre: edit.nombre || currentUser.rows[0].nombre,
      telefono: edit.telefono || currentUser.rows[0].telefono,
      est_financiero: edit.est_financiero || currentUser.rows[0].est_financiero,
      suscripcion: edit.suscripcion || currentUser.rows[0].suscripcion,
    };

    const updateUserQuery = `
      UPDATE cliente 
      SET nombre=$1, telefono=$2, est_financiero=$3, suscripcion=$4
      WHERE id=$5
    `;
    await client.query(updateUserQuery, [
      updatedUser.nombre,
      updatedUser.telefono,
      updatedUser.est_financiero,
      updatedUser.suscripcion,
      id,
    ]);

    // Obtener todos los dispositivos existentes para este usuario
    const getDispositivosQuery = `SELECT login_user FROM dispositivo WHERE id_cliente = $1`;
    const existingDispositivos = await client.query(getDispositivosQuery, [id]);
    const existingLogins = existingDispositivos.rows.map(d => d.login_user);

    const insertDispositivosQuery = `
      INSERT INTO dispositivo (id_cliente, login_user, clave)
      VALUES ($1, $2, $3)
      ON CONFLICT (login_user) DO NOTHING
    `;

    for (const dispositivo of dispositivos) {
      console.log("Procesando dispositivo:", dispositivo);

      if (dispositivo.login_user && dispositivo.clave) {
        // Verificar si el dispositivo ya existe en el array obtenido
        if (!existingLogins.includes(dispositivo.login_user)) {
          const result = await client.query(insertDispositivosQuery, [id, dispositivo.login_user, dispositivo.clave]);
          console.log("Insertando dispositivo:", dispositivo.login_user, dispositivo.clave);
          console.log("Filas afectadas:", result.rowCount); // Verifica si realmente se insertó
        } else {
          console.log(`Dispositivo con login_user ${dispositivo.login_user} ya existe.`);
        }
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Datos del usuario y dispositivos actualizados correctamente.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Error al editar los datos de este usuario y dispositivos.' });
  } finally {
    client.release();
  }
};

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