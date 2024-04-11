import pool from "./db.connect.js"

const db = pool

async function createSchema(nombreCliente) {
  const connection = await db.connect()
  try {
    await connection.query(`CREATE SCHEMA IF NOT EXISTS "${nombreCliente}"`)

    const { rowCount } = await connection.query(`SELECT 1 FROM pg_roles WHERE rolname = $1`, [`${nombreCliente}_user`])
    if (rowCount === 0) {
      await connection.query(`CREATE ROLE "${nombreCliente}_user"`)
    }

    await connection.query(`GRANT ALL ON SCHEMA "${nombreCliente}" TO "${nombreCliente}_user"`)
  } catch (err) {
    console.error('Error al crear el schema' + err)
    throw err
  } finally {
    connection.release()
  }
}

async function connectToClientSchema(nombreCliente) {
  try {
    const query = 'SELECT instance FROM instancia WHERE nombre_cliente = $1'
    const result = await db.query(query, [nombreCliente])
    const clientSchema = result.rows[0].instance

    await db.query(`SET search_path TO "${clientSchema}"`)

    console.log(`Cliente '${nombreCliente}' conectado a su schema '${clientSchema}'.`)
  } catch (error) {
    console.error('Error al conectar al cliente a su schema:', error)
    throw error
  }
}

export { 
  createSchema,
  connectToClientSchema
}