import instance from '@g/api'

async function updateUser(id, data) {
  try {
    const res = await instance.patch(`/edit/user/${id}`, data)
    return res
  } catch (err) { console.error(err) }
}

export { updateUser }