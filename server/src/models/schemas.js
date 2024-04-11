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

async function connectToClientSchema(identificacion, instancia) {
  console.log(identificacion, instancia)
  const client = await db.connect()
  try {
    const clienteQuery = `
      SELECT instancia
      FROM instancia
      WHERE id_cliente = (
        SELECT id
        FROM cliente
        WHERE identificacion = $1
      )
    `
    const clienteValues = [identificacion];
    const clienteResult = await client.query(clienteQuery, clienteValues)

    if (clienteResult.rows.length === 0) {
      throw new Error('Cliente no encontrado o instancia incorrecta.')
    }

    const clientSchema = clienteResult.rows[0].instancia

    await db.query(`SET search_path TO "${clientSchema}"`)

    console.log(`Cliente '${identificacion}' conectado a su schema '${clientSchema}'.`)
  } catch (error) {
    console.error('Error al conectar al cliente a su schema:', error)
    throw error
  } finally {
    client.release()
  }
}

async function pruebaConexionCliente(identificacion, nombreCliente, instancia) {
  try {
    connectToClientSchema(identificacion, instancia)

    const query = `INSERT INTO "${nombreCliente}".prueba (nombre, apellifo) VALUES ($1, $2)`
    const values = ['Sugey', 'Chacón']
    await db.query(query, values)

    console.log(`Datos insertados en la tabla de prueba del schema del cliente ${nombreCliente}`)
  } catch (error) {
    console.error('Error al probar la conexión del cliente:', error)
    throw error
  }
}

async function createTableInSchema(nombreCliente, nombreTabla) {
  try {
    const query = `
      CREATE TABLE "${nombreCliente}"."${nombreTabla}" (
        id serial PRIMARY KEY,
        nombre TEXT,
        apellifo TEXT
      );
    `
    await db.query(query);
    console.log(`Tabla '${nombreTabla}' creada en el esquema '${nombreCliente}'.`)
  } catch (error) {
    console.error('Error al crear la tabla en el esquema:', error)
    throw error
  }
}

export { 
  createSchema,
  connectToClientSchema,
  pruebaConexionCliente,
  createTableInSchema
}