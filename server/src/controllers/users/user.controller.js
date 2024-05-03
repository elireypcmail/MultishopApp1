import pool from "../../models/db.connect.js"

const controllerUs = {}
const db = pool

controllerUs.getadmins = async (req, res) => {
  try {
    const sql =  `SELECT * FROM users`
    const admins = await db.query(sql)
    if (admins.rowCount > 0) {
      return res.status(200).json({ "message": "Listado de Admins", "data": admins.rows })
    }
    return res.status(404).json({ "message": "No hay administradores registrados"})
  } catch (err) {
    console.error(err)
    return  res.status(500).json({ "message": 'Error al obtener los administradores' })
  }
}

controllerUs.filtrarAdminsPorLetra = async (req, res) => {
  try {
    const { letra } = req.body 

    const client = await pool.connect()
    const query = `
      SELECT * FROM users
      WHERE LOWER(username) LIKE '%' || LOWER($1) || '%';
    `
    const result = await client.query(query, [letra])

    client.release()

    res.status(200).json({ "message": "Se encontraron coincidencias", "data": result.rows })
  } catch (error) {
    console.error('Error al filtrar clientes:', error)
    res.status(500).json({ message: 'Error al filtrar clientes' })
  }
}

controllerUs.register = async (req, res) => {
  try {
    const newUser = req.body

    if(!newUser) return res.status(400).json({ 'message': 'Ha ocurrido un error al registrar el usuario' })

    const sqlUser = `SELECT * FROM users WHERE email = $1;`
    let userExist = await db.query(sqlUser, [ newUser?.email ])

    if (userExist.rows.length > 0) {
      return res.status(200).json({ "message": 'El correo electrónico ya está registrado' })
    }

    const sql = `INSERT INTO users ( username, email, password ) VALUES ($1, $2, $3)`
    const values = [ newUser?.name, newUser?.email, newUser?.password ]

    const result = await db.query(sql, [ newUser?.name, newUser?.email, newUser?.password ])
    if (result.rowCount === 1) {
      return res.status(200).json({ 'message': 'Usuario creado correctamente', 'data': values })
    } 
    return res.json({ 'message': 'No se pudo crear el usuario' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": "Error al crear usuario" })
  }
}

controllerUs.login = async (req, res) => {
  try {
    const user = req.body

    const sql = `SELECT * FROM users WHERE email = $1;`
    const userData = [user.email]

    const client = await pool.connect()
    const result = await client.query(sql, userData)
    client.release()

    if (result.rows.length === 0) {
      return res.status(200).json({ "message": "Este correo no existe o no es correcto. Intente de nuevo." })
    }

    if (user.password !== result.rows[0].password) {
      return res.status(200).json({ "message": "Contraseña incorrecta" })
    }

    return res.status(200).json({ "message": "Sesión iniciada correctamente", "data": result.rows[0] }) 
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": "Error al iniciar sesión" })
  }
}

controllerUs.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const delsql =  `DELETE FROM users WHERE id=$1 RETURNING *`
    await db.query(delsql, [ id ])

    return res.status(200).json({ "message": "Administrador eliminado" })
  } catch (err) {
    console.error(err)
    return res.status(500).send({  "message": "Error al eliminar administrador" })
  }
}

export default controllerUs