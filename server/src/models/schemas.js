import pool from "./db.connect.js"

const db = pool

async function createSchema(identificacion) {
  const connection = await db.connect()
  try {
    const schemaName = `${identificacion}`

    await connection.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)

    const { rowCount } = await connection.query(
      `SELECT 1 FROM pg_roles WHERE rolname = $1`,
      [`${schemaName}_user`]
    )
    if (rowCount === 0) await connection.query(`CREATE ROLE "${schemaName}_user"`)

    await connection.query(`GRANT ALL ON SCHEMA "${schemaName}" TO "${schemaName}_user"`)

    console.log(`Esquema '${schemaName}' creado exitosamente.`)
  } catch (err) {
    console.error('Error al crear el esquema del cliente:', err)
    throw err
  } finally {
    connection.release()
  }
}

async function deleteSchema(clientId) {
  console.log(clientId)
  const connection = await db.connect()
  try {
    const clientQuery  = `SELECT identificacion FROM cliente WHERE id = $1`
    const clientResult = await connection.query(clientQuery, [clientId])

    if (clientResult.rows.length === 0) throw new Error(`No se encontró ningún cliente con el ID ${clientId}`) 

    const identificacionCliente = clientResult.rows[0].identificacion

    await connection.query(`DROP SCHEMA IF EXISTS "${identificacionCliente}" CASCADE`)
    await connection.query(`DROP ROLE IF EXISTS "${identificacionCliente}_user"`)
  } catch (err) {
    console.error('Error al eliminar el schema del cliente:', err)
    throw err
  } finally {
    connection.release()
  }
}

async function connectToClientSchema(identificacion, nombre_cliente, instance) {
  const client = await db.connect()
  try {
    console.log(identificacion)
    console.log(nombre_cliente)

    const clienteQuery = `
      SELECT instancia
      FROM instancia
      WHERE id_cliente = (
        SELECT id
        FROM cliente
        WHERE identificacion = $1
        AND nombre = $2
        LIMIT 1
      )
      LIMIT 1
    `
    const clienteValues = [identificacion, nombre_cliente]
    const clienteResult = await client.query(clienteQuery, clienteValues)

    if (clienteResult.rows.length === 0) throw new Error('Cliente no encontrado o instancia incorrecta.')

    const clientSchema = clienteResult.rows[0].instancia
    console.log('clienteResult' + clientSchema)

    await db.query(`SET search_path TO "${identificacion}"`)
    console.log(`Cliente '${identificacion}' conectado a su schema '${identificacion}'.`)

    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = $1
    `

    const tablesResult = await client.query(tablesQuery, [clientSchema])
    const ventaQuery   = `SELECT * FROM ${identificacion}.ventas`
    const ventaResult  = await client.query(ventaQuery)
  } catch (error) {
    console.error('Error al conectar al cliente a su schema:', error)
  } finally {
    client.release()
  }
}

async function createTableInSchema(nombreCliente, nombreTabla) {
  try {
    const query = `
        CREATE TABLE "${nombreCliente}"."${nombreTabla}" (
          id Serial NOT NULL, 
          fecha date NOT NULL,
          cantidadfac integer NOT NULL DEFAULT 0,
          totalcosto numeric(25,2) NOT NULL DEFAULT 0,
          totalut numeric(25,2) NOT NULL DEFAULT 0,
          totalventa numeric(25,2) NOT NULL DEFAULT 0,
          cantidadund integer NOT NULL DEFAULT 0,
          clientesa integer NOT NULL DEFAULT 0,
          clientesf integer NOT NULL DEFAULT 0,
          clientesn integer NOT NULL DEFAULT 0,
          valor_tp numeric(25,2) NOT NULL DEFAULT 0,
          valor_up numeric(25,2) NOT NULL DEFAULT 0,
          valor_uxb numeric(25,2) NOT NULL DEFAULT 0,
          cantidadfac_cd integer NOT NULL DEFAULT 0,
          totalventa_cd numeric(25,2) NOT NULL DEFAULT 0,
          sincroniza smallint DEFAULT 0,
          sincronizaf timestamp without time zone NOT NULL,
          cod_clibs character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
          nom_clibs character varying(240) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
          totalventa_bs numeric(25,2) NOT NULL DEFAULT 0,
          cod_art_bs character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
          nom_art_bs character varying(240) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
          totalventa_bs_art numeric(25,2) NOT NULL DEFAULT 0,
          cantidad_und_inv integer NOT NULL DEFAULT 0,
          total_usdca_inv numeric(25,2) NOT NULL DEFAULT 0,
          total_usdcp_inv numeric(25,2) NOT NULL DEFAULT 0,
          total_bsca_inv numeric(25,2) NOT NULL DEFAULT 0,
          total_bscp_inv numeric(25,2) NOT NULL DEFAULT 0,
          cod_op_bs character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
          nom_op_bs character varying(240) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
          totalventa_bs_op numeric(25,2) NOT NULL DEFAULT 0,
          margendeldia numeric(25,2) NOT NULL DEFAULT 0,
          cod_fab_bs character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
          nom_fab_bs character varying(240) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
          totalventa_fab_bs numeric(25,2) NOT NULL DEFAULT 0,
          unidades_fab_bs numeric(25,2) NOT NULL DEFAULT 0,
          totalcompra numeric(25,2) NOT NULL DEFAULT 0,
          codemp character varying(20) NOT NULL DEFAULT ''::character varying,
          nomemp character varying(240) NOT NULL DEFAULT ''::character varying,
          nomempc character varying(10) NOT NULL DEFAULT ''::character varying,
          totusd numeric(25,2) NOT NULL DEFAULT 0,
          totcop numeric(25,2) NOT NULL DEFAULT 0,
          totbs numeric(25,2) NOT NULL DEFAULT 0;
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
  createTableInSchema
}