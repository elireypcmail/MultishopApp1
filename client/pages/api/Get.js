import instance from '@g/api'

async function getUsers(search) {
  try {
    const res = await instance.get('/clients', {
      params: {
        search
      }
    })
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function getUser(id) {
  try {
    const res = await instance.get(`/clients/${id}`)
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function getNotifyClient(id, params = {}) {
  try {
    const { start, end, ...rest } = params
    const res = await instance.get(`/clients/${id}/notify`, {
      params: start && end ? { start, end, ...rest } : rest
    })
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function getAdmins() {
  try {
    const res = await instance.get('/users')
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function getAdmin(id) {
  try {
    const res = await instance.get(`/users/${id}`)
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function getAdminByEmail(email) {
  try {
    const res = await instance.get(`/users/email/${email}`)
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function getMove(id, params = {}) {
  try {
    const { start, end, ...rest } = params
    const res = await instance.get(`/clients/${id}/auditoria`, {
      params: start && end ? { start, end, ...rest } : rest
    })
    return res
  } catch (err) {
    if (err?.response) {
      return { data: err?.response?.data }
    }
  }
}

async function getApiKeys(schema) {
  try {
    const res = await instance.get('/users/api-keys', { params: { schema } })
    return res
  } catch (err) {
    if (err?.response) return { data: err?.response?.data }
    throw err
  }
}

async function getApiKeyById(id, schema) {
  try {
    const res = await instance.get(`/users/api-keys/${id}`, { params: { schema } })
    return res
  } catch (err) {
    if (err?.response) return { data: err?.response?.data }
    throw err
  }
}

async function getJobs(schema, params = {}) {
  try {
    const { page, limit, date_from, date_to } = params
    const query = { schema }
    if (page != null) query.page = page
    if (limit != null) query.limit = limit
    if (date_from) query.date_from = date_from
    if (date_to) query.date_to = date_to
    const res = await instance.get('/users/jobs', { params: query })
    return res
  } catch (err) {
    if (err?.response) return { data: err?.response?.data }
    throw err
  }
}

async function getJobById(jobId, schema) {
  try {
    const res = await instance.get(`/users/jobs/${jobId}`, { params: { schema } })
    return res
  } catch (err) {
    if (err?.response) return { data: err?.response?.data }
    throw err
  }
}

export {
  getUsers,
  getUser,
  getNotifyClient,
  getAdmins,
  getAdmin,
  getAdminByEmail,
  getMove,
  getApiKeys,
  getApiKeyById,
  getJobs,
  getJobById,
}