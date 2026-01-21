import pool from '../../models/db.connect.js'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment-timezone'
import { connectToClientSchema } from '../../models/schemas.js'

const controllerCode = {}
const bd = pool

controllerCode.generateCode = async (req, res) => {
  const { identificacion, id_user, codigo } = req.body
  const data = req.body

  // console.log(req.body)
  console.log("--")
  console.log({identificacion, id_user, codigo})

  if (!identificacion || !id_user) return res.status(400).json({ message: 'Faltan parámetros: identificacion o id_user' })

  const client = await bd.connect()
  try {
    // Conectar al schema del cliente
    // await connectToClientSchema(identificacion, null, null)

    const fecha = moment().format('YYYY-MM-DD HH:mm:ss')

    // Guardar en la tabla tokenuso del schema del cliente
    const sql = `
      INSERT INTO ${identificacion}.tokenuso (id_user, codigo, fecha)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await client.query(sql, [id_user, codigo, fecha])

    return res.status(201).json({
      message: 'Código generado correctamente',
      data: result.rows[0]
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error al generar el código' })
  } finally {
    try {
      await client.query('RESET search_path')
    } catch (resetErr) {
      console.error('Error al resetear search_path', resetErr)
    }
    client.release()
  }
}

/**
 * Verificar un código para un cliente específico
 */
controllerCode.verifyCode = async (req, res) => {
  const { identificacion, id_user, codigo } = req.body

  if (!identificacion || !id_user || !codigo)
    return res.status(400).json({ message: 'Faltan parámetros' })

  const client = await bd.connect()

  try {
    await client.query('BEGIN')

    // 1. Buscar el código en tokenuso
    const findSql = `
      SELECT *
      FROM ${identificacion}.tokenuso
      WHERE id_user = $1 AND codigo = $2
      ORDER BY fecha DESC
      LIMIT 1
      FOR UPDATE
    `
    const result = await client.query(findSql, [id_user, codigo])

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Código no encontrado o inválido' })
    }

    const token = result.rows[0]

    // 2. Insertar en movimientos (status 1 = usado)
    const insertMovSql = `
      INSERT INTO ${identificacion}.movimientos (id_user, codigo, status, fecha)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const movResult = await client.query(insertMovSql, [
      token.id_user,
      token.codigo,
      1,
      token.fecha
    ])

    // 3. Eliminar de tokenuso
    const deleteSql = `
      DELETE FROM ${identificacion}.tokenuso
      WHERE id = $1
    `
    await client.query(deleteSql, [token.id])

    await client.query('COMMIT')

    return res.status(200).json({
      message: 'Código validado y consumido correctamente',
      movimiento: movResult.rows[0]
    })

  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    return res.status(500).json({ message: 'Error al validar el código' })
  } finally {
    try { await client.query('RESET search_path') } catch {}
    client.release()
  }
}

controllerCode.validateCode = async (req, res) => {
  const { identificacion, id_user, codigo } = req.body

  console.log("validate")

  if (!identificacion || !id_user || !codigo)
    return res.status(400).json({ message: 'Faltan parámetros' })

  const client = await bd.connect()

  try {
    /**
     * 1️⃣ ¿El token sigue activo?
     */
    const tokenSql = `
      SELECT id, fecha
      FROM ${identificacion}.tokenuso
      WHERE id_user = $1 AND codigo = $2
      ORDER BY fecha DESC
      LIMIT 1
    `
    const tokenResult = await client.query(tokenSql, [id_user, codigo])

    if (tokenResult.rows.length > 0) {
      return res.status(200).json({
        valid: true,
        status: 0, // activo
        message: 'Código vigente',
        data: tokenResult.rows[0]
      })
    }

    /**
     * 2️⃣ Buscar en movimientos (ya procesado)
     */
    const movSql = `
      SELECT status, fecha
      FROM ${identificacion}.movimientos
      WHERE id_user = $1 AND codigo = $2
      ORDER BY fecha DESC
      LIMIT 1
    `
    const movResult = await client.query(movSql, [id_user, codigo])

    if (movResult.rows.length === 0) {
      return res.status(404).json({
        valid: false,
        message: 'Código inválido o inexistente'
      })
    }

    const movimiento = movResult.rows[0]

    /**
     * 3️⃣ Responder según status
     */
    if (movimiento.status === 1) {
      return res.status(200).json({
        valid: false,
        status: 1,
        message: 'Código ya fue usado',
        fecha: movimiento.fecha
      })
    }

    if (movimiento.status === 2) {
      return res.status(200).json({
        valid: false,
        status: 2,
        message: 'Código expirado o deshabilitado',
        fecha: movimiento.fecha
      })
    }

    return res.status(200).json({
      valid: false,
      message: 'Estado desconocido'
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error al validar el código' })
  } finally {
    try { await client.query('RESET search_path') } catch {}
    client.release()
  }
}


/**
 * Deshabilitar un código en el schema del cliente
 */
controllerCode.disableCode = async (req, res) => {
  const { identificacion, id_user, codigo } = req.body

  console.log("deshabilitar")

  if (!identificacion || !id_user || !codigo)
    return res.status(400).json({ message: 'Faltan parámetros' })

  const client = await bd.connect()

  try {
    await client.query('BEGIN')

    // 1. Buscar el código en tokenuso
    const findSql = `
      SELECT *
      FROM ${identificacion}.tokenuso
      WHERE id_user = $1 AND codigo = $2
      ORDER BY fecha DESC
      LIMIT 1
      FOR UPDATE
    `
    const result = await client.query(findSql, [id_user, codigo])

    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'Código no encontrado o ya procesado' })
    }

    const token = result.rows[0]

    // 2. Insertar en movimientos con status = 2 (deshabilitado)
    const insertMovSql = `
      INSERT INTO ${identificacion}.movimientos (id_user, codigo, status, fecha)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const movResult = await client.query(insertMovSql, [
      token.id_user,
      token.codigo,
      2,
      token.fecha
    ])

    // 3. Eliminar de tokenuso
    const deleteSql = `
      DELETE FROM ${identificacion}.tokenuso
      WHERE id = $1
    `
    await client.query(deleteSql, [token.id])

    await client.query('COMMIT')

    return res.status(200).json({
      message: 'Código deshabilitado correctamente',
      movimiento: movResult.rows[0]
    })

  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    return res.status(500).json({ message: 'Error al deshabilitar el código' })
  } finally {
    try { await client.query('RESET search_path') } catch {}
    client.release()
  }
}


export default controllerCode
