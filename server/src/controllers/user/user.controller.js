import pool from '../../models/db.connect.js'

const controller = {}

controller.getUsers = async (req, res) => {
  try {
    const sql = `SELECT * FROM usuario LIMIT 5;`
    const user = await pool.query(sql)

    if (user?.rows.length > 0) res.status(200).json({ message: 'Usuarios cargados correctamente', data: user.rows })
    else res.status(404).json({ message: 'No hay usuarios registrados' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al traer los datos'})
  }
}

controller.getUser = async (req, res) => {
  try {
    const { id } = req.params

    const sql = `SELECT * FROM usuario WHERE id=$1`
    const user = await pool.query(sql, [ id ])
    if (user?.rows.length == 0) res.status(404).json({ message: 'Usuario no encontrado' }) 
    else res.status(200).json({ message: 'Usuario encontrado', data: user?.rows[0] }) 
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al traer los datos del usuario' })
  }
}

controller.postUser = async (req, res) => {
  try {
    const data = req.body

    const bd = pool
    if (!data?.identificacion || !data?.nombre) {
      res.status(400).json({ message: "Faltan datos del usuario" })
      return
    }

    const sql = `INSERT INTO usuario(identificacion, nombre, telefonos, dispositivos, per_contacto, est_financiero, clave, instancia) VALUES($1, $2, $3, $4, $5, $6, $7, $8);`

    const result = await bd.query(sql, 
      [
        data?.identificacion,
        data?.nombre,
        data?.telefonos,
        data?.dispositivos,
        data?.per_contacto,
        data?.est_financiero, 
        data?.clave,
        data?.instancia,
      ]
    )
    
    if (result) res.status(200).json({ message: "Usuario creado correctamente" }) 
    else res.status(200).json({ message: 'No se pudo crear el usuario' }) 
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Error al crear usuario" })
  }
}

controller.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const edit   = req.body

    const sql = `UPDATE usuario SET nombre=$1, telefonos=$2, dispositivos=$3, per_contacto=$4, est_financiero=$5, clave=$6 WHERE id=$7;`
    const user = await pool.query(sql, 
      [ 
        edit?.nombre,
        edit?.telefonos,
        edit?.dispositivos,
        edit?.per_contacto,
        edit?.est_financiero, 
        edit?.clave,
        id
      ]
    )
    
    if(user.rowCount == 1) res.status(200).json({ message: 'Datos del usuario editados correctamente' })
    else res.status(404).json({ message: 'El usuario no existe' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al editar los datos de este usuario' })
  }
}

controller.deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const sql  = `DELETE FROM usuario WHERE id =$1`
    const user = await pool.query(sql, [ id ])
    res.status(200).json({ message: 'Se ha eliminado el usuario correctamente' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error al eliminar este usuario' })
  }
}

export default controller