import pool from "../../models/db.connect.js"

const controllerUs = {}
const db = pool

controllerUs.getadmins = async (req, res) => {
  try {
    const sql    =  `SELECT * FROM users ORDER BY username ASC`
    const admins = await db.query(sql)
    if (admins.rowCount > 0) return res.status(200).json({ "message": "Listado de Admins", "data": admins.rows })
    return res.status(404).json({ "message": "No hay administradores registrados"})
  } catch (err) {
    console.error(err)
    return  res.status(500).json({ "message": 'Error al obtener los administradores' })
  }
}

controllerUs.getAdminByEmail = async (req, res) => {
  try {
    const { email } = req.params
    const sql       = `SELECT * FROM users WHERE email = $1`
    const admin     = await pool.query(sql, [email])

    if (admin.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' })

    const adminData = {
      id:       admin.rows[0].id,
      username: admin.rows[0].username,
      email:    admin.rows[0].email,
      password: admin.rows[0].password,
    }

    return res.status(200).json({ message: 'Usuario encontrado', data: adminData })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error al obtener el usuario' })
  }
}

controllerUs.getAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const sql = `
      SELECT * FROM users WHERE id = $1
    `
    
    const admin = await pool.query(sql, [id])
    if (admin?.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    } else {
      const adminData = {
        id: admin.rows[0].id,
        username: admin.rows[0].username,
        email: admin.rows[0].email,
        password: admin.rows[0].password
      }

      return res.status(200).json({ message: 'Usuario encontrado', data: adminData })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error al traer los datos del usuario' })
  }
}

controllerUs.filtrarAdminsPorLetra = async (req, res) => {
  try {
    const { letra } = req.body 

    const client = await pool.connect()
    const query  = `
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

    if (userExist.rows.length > 0) return res.status(200).json({ "message": 'El correo electrónico ya está registrado' })

    const sql    = `INSERT INTO users ( username, email, password ) VALUES ($1, $2, $3)`
    const values = [ newUser?.username, newUser?.email, newUser?.password ]

    const result = await db.query(sql, [ newUser?.username, newUser?.email, newUser?.password ])
    if (result.rowCount === 1) return res.status(200).json({ 'message': 'Usuario creado correctamente', 'data': values })
    return res.json({ 'message': 'No se pudo crear el usuario' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": "Error al crear usuario" })
  }
}

controllerUs.login = async (req, res) => {
  try {
    const user = req.body

    const sql      = `SELECT * FROM users WHERE email = $1;`
    const userData = [user.email]

    const client = await pool.connect()
    const result = await client.query(sql, userData)
    client.release()

    if (result.rows.length === 0)  return res.status(200).json({ "message": "Este correo no existe o no es correcto. Intente de nuevo." })
    if (user.password !== result.rows[0].password) return res.status(200).json({ "message": "Contraseña incorrecta" })

    return res.status(200).json({ "message": "Sesión iniciada correctamente", "data": result.rows[0] }) 
  } catch (err) {
    console.error(err)
    return res.status(500).json({ "message": "Error al iniciar sesión" })
  }
}

controllerUs.updateAdmin = async (req, res) => {
  const client = await pool.connect()
  let transactionActive = false
  const rollbackIfActive = async () => {
    if (!transactionActive) return false
    transactionActive = false
    await client.query('ROLLBACK')
    return true
  }
  try {
    const { id }      = req.params
    const { ...edit } = req.body

    await client.query('BEGIN')
    transactionActive = true

    let updateAdminQuery    = 'UPDATE users SET'
    const updateAdminValues = []
    const params            = []

    Object.keys(edit).forEach((key, index) => {
      if (edit[key]) {
        updateAdminQuery += ` ${key}=$${index + 1},`
        updateAdminValues.push(edit[key])
        params.push(key)
      }
    })

    updateAdminQuery = updateAdminQuery.slice(0, -1)

    updateAdminQuery += ` WHERE id=$${updateAdminValues.length + 1}`
    updateAdminValues.push(id)

    await client.query(updateAdminQuery, updateAdminValues)

    await client.query('COMMIT')
    transactionActive = false
    res.status(200).json({ message: 'Datos del administrador actualizados correctamente' })
  } catch (err) {
    await rollbackIfActive()
    console.error(err)
    res.status(500).json({ message: 'Error al editar los datos de este administrador' })
  } finally {
    client.release()
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