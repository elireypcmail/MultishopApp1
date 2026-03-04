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

export {
  getUsers,
  getUser,
  getNotifyClient,
  getAdmins,
  getAdmin,
  getAdminByEmail,
  getMove
}