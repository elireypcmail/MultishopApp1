import pool from '../../models/db.connect.js'

const controller = {}

controller.postUser = async (req, res) => {
  try {
    const data = req.body

    const bd = pool
    if (!data.identificacion || !data.nombre) {
      res.status(400).send({ message: "Faltan datos del usuario" })
      return
    }

    const sql = `INSERT INTO usuario(identificacion, nombre, telefonos, dispositivos, per_contacto, est_financiero, clave, instancia) VALUES($1, $2, $3, $4, $5, $6, $7, $8);`

    const result = await bd.query(sql, 
      [
        data.identificacion,
        data.nombre,
        data.telefonos,
        data.dispositivos,
        data.per_contacto,
        data.est_financiero, 
        data.clave,
        data.instancia,
      ]
    )
    
    if (result) { res.status(200).send({ message: "Usuario creado correctamente" }) } 
    else { res.status(200).send({ message: 'No se pudo crear el usuario' }) }
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Error al crear usuario" })
  }
}

export default controller