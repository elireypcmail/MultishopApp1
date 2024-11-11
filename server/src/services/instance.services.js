import pool from "../models/db.connect.js"

const db = pool

function generateUniqueInstanceName(nombreCliente) {
  const randomString = Math.random().toString(36).substring(2, 8)
  const timestamp    = new Date().getTime()
  const instanceName = `${nombreCliente.replace(/\s/g, '_').toLowerCase()}_${randomString}_${timestamp}`
  return instanceName
}

async function createInstanceForClient(clientId, nombreCliente) {
  const instancia = generateUniqueInstanceName(nombreCliente)

  try {
    const clienteExistsQuery  = 'SELECT id FROM cliente WHERE id = $1;'
    const clienteExistsValues = [clientId]
    const clienteExistsResult = await db.query(clienteExistsQuery, clienteExistsValues)

    if (clienteExistsResult.rows.length === 0) throw new Error(`El cliente con ID ${clientId} no existe.`)

    const query  = 'INSERT INTO instancia (id_cliente, nombre_cliente, instance) VALUES ($1, $2, $3)'
    const values = [clientId, nombreCliente, instancia]
    await db.query(query, values)

    console.log(`Instancia '${instancia}' creada para el cliente ${nombreCliente} (${clientId}).`)
  } catch (error) {
    console.error('Error al crear la instancia para el cliente:', error)
    throw error
  }
}

export {
  generateUniqueInstanceName,
  createInstanceForClient
}