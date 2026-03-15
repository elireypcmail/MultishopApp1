import instance from '@g/api'

async function renovarFechaCorte(id, date) {
  try {
    const res = await instance.post('/clients/renew-date', { userId: id, corte: date })
    return res.data
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function registroCliente(data) {
  try {
    const res = await instance.post('/clients/register', data)
    return { success: true, data: res.data }
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data, success: false, error: err }
    }
    return { success: false, error: err }
  }
}

async function registroAdmin(data) {
  try {
    const res = await instance.post('/users/register', data)
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function loginAdmin(data) {
  try {
    const res = await instance.post('/users/login', data)
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response.data }
    }
  }
}

async function filtrarClientesPorLetra(letra) {
  try {
    const res = await instance.post('/clients/filter', { letra })
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function createApiKey(body) {
  try {
    const res = await instance.post('/users/api-keys', body)
    return res
  } catch (err) {
    if (err?.response) return { data: err?.response?.data }
    throw err
  }
}

export {
  registroCliente,
  registroAdmin,
  loginAdmin,
  filtrarClientesPorLetra,
  renovarFechaCorte,
  createApiKey,
}