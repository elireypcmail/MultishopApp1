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

async function deleteSchema(clientId) {
  console.log(clientId)
  const connection = await db.connect()
  try {
    // Busca el nombre del cliente para su schema
    const clientQuery = `SELECT nombre FROM cliente WHERE id = $1`
    const clientResult = await connection.query(clientQuery, [clientId])

    // Verifica si se obtuvo un resultado válido
    if (clientResult.rows.length === 0) {
      throw new Error(`No se encontró ningún cliente con el ID ${clientId}`)
    }

    const nombreCliente = clientResult.rows[0].nombre

    // Elimina el schema y el rol asociado
    await connection.query(`DROP SCHEMA IF EXISTS "${nombreCliente}" CASCADE`)
    await connection.query(`DROP ROLE IF EXISTS "${nombreCliente}_user"`)
  } catch (err) {
    console.error('Error al eliminar el schema del cliente:', err)
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
  } finally {
    client.release()
  }
}

/* async function pruebaConexionCliente(identificacion, nombreCliente, instancia) {
  try {
    connectToClientSchema(identificacion, instancia)

    const query = `INSERT INTO "${nombreCliente}".prueba (dato1, dato2) VALUES ($1, $2)`
    const values = ['Dato1', 'Dato2']
    await db.query(query, values)

    console.log(`Datos insertados en la tabla de prueba del schema del cliente ${nombreCliente}`)
  } catch (error) {
    console.error('Error al probar la conexión del cliente:', error)
  }
} */

async function createTableInSchema(nombreCliente, nombreTabla) {
  try {
    const query = `
      CREATE TABLE "${nombreCliente}"."${nombreTabla}" (
        id serial NOT NULL,
        fecha date NOT NULL,
        cantidadfac integer NOT NULL DEFAULT 0,
        totalcosto decimal(25,2) NOT NULL DEFAULT 0,
        totalut decimal(25,2) NOT NULL DEFAULT 0,
        totalventa decimal(25,2) NOT NULL DEFAULT 0,
        cantidadund integer NOT NULL DEFAULT 0,
        clientesa integer NOT NULL DEFAULT 0,
        clientesf integer NOT NULL DEFAULT 0,
        clientesn integer NOT NULL DEFAULT 0,
        valor_tp decimal(25,2) NOT NULL DEFAULT 0,
        valor_up decimal(25,2) NOT NULL DEFAULT 0,
        valor_uxb decimal(25,2) NOT NULL DEFAULT 0,
        cantidadfac_cd integer NOT NULL DEFAULT 0,
        totalventa_cd decimal(25,2) NOT NULL DEFAULT 0,
        sincroniza smallint DEFAULT 0,
        sincronizaf timestamp NOT NULL,
        cod_clibs character varying(20) NOT NULL DEFAULT '',
        nom_clibs character varying(240) NOT NULL DEFAULT '',
        totalventa_bs decimal(25,2) NOT NULL DEFAULT 0,
        cod_art_bs character varying(20) NOT NULL DEFAULT '',
        nom_art_bs character varying(240) NOT NULL DEFAULT '',
        totalventa_bs_art decimal(25,2) NOT NULL DEFAULT 0,
        CONSTRAINT pk_id PRIMARY KEY (id)
      );
    `
    await db.query(query)
    console.log(`Tabla '${nombreTabla}' creada en el esquema '${nombreCliente}'.`)
  } catch (error) {
    console.error('Error al crear la tabla en el esquema:', error)
  }
}

export { 
  createSchema,
  deleteSchema,
  connectToClientSchema,
  //pruebaConexionCliente,
  createTableInSchema
}