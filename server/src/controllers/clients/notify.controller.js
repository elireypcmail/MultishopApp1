import pool from "../../models/db.connect.js"

const controllerNoti = {}
const db = pool

function formatDate(date) {
  const formattedDate = new Date(date)
  const day = formattedDate.getDate()
  const month = formattedDate.getMonth() + 1 
  const year = formattedDate.getFullYear()
  return `${day}/${month}/${year}`
}

controllerNoti.notifyClient = async (req, res) => {
  try {
    const { id } = req.params

    const client = await db.connect()

    const notificacionesQuery = `
      SELECT n.*, n.id_dispositivo
      FROM notificacion n
      WHERE n.id_user = $1
      ORDER BY n.fecha DESC
    `
    const notificacionesValues = [id]
    const notificacionesResult = await client.query(notificacionesQuery, notificacionesValues)
    const notificaciones = notificacionesResult.rows.map((notificacion) => ({
      ...notificacion,
      fecha: formatDate(notificacion.fecha), 
    }))

    res.status(200).json({ "userId": id, "data": notificaciones })

    client.release()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "error": 'Error en las notificaciones del cliente' })
  }
}

controllerNoti.findByDate = async (req, res) => {
  try {
    const { userId, inicio, fin } = req.body 

    const client = await db.connect()

    const notificacionesQuery = `
      SELECT * FROM notificacion
      WHERE id_user = $1
      AND fecha BETWEEN $2 AND $3
      ORDER BY fecha DESC
    `
    const notificacionesValues = [userId, inicio, fin]
    const notificacionesResult = await client.query(notificacionesQuery, notificacionesValues)
    const notificaciones = notificacionesResult.rows

    if (notificaciones.length === 0) {
      return  res.status(404).json({ "message": "No se encontraron notificaciones con esa fecha."})
    }

    res.status(200).json({ "userId": userId, "data": notificaciones })

    client.release()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "error": "Error al buscar notificaciones por fecha" })
  }
}

export default controllerNoti