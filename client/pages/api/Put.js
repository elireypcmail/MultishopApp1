import instance from '@g/api'

async function updateUser(id, data) {
  try {
    const res = await instance.patch(`/edit/user/${id}`, data)
    return res
  } catch (err) { console.error(err) }
}

async function updateState(id) {
  try {
    const res = await instance.put(`/cambiar/estado/${id}`)
    console.log(res)
    
    return res
  } catch (err) { console.error(err) }
}

async function updateAdmin(id, data) {
  try {
    const res = await instance.patch(`/edit/admin/${id}`, data)
    console.log(res)
    return res
  } catch (err) { console.error(err) }
}

export { updateUser, updateAdmin, updateState }