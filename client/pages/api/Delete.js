import instance from '@g/api'
import v        from '@g/_var'

async function deleteClient(id) {
  try {
    const res =  await instance.delete(`${v.DEL_CLIENT}/${id}`)
    return res
  } catch (err) { console.error(err) }
}

const deleteDevice = async (login_user) => {
  console.log(login_user)
  try {
    const res = await instance.delete(`${v.DEL_DEVICE}/${login_user}`)
    return res
  } catch (err) {
    console.error('Error al eliminar el dispositivo:', err)
  }
}

async function deleteAdmin(id) {
  console.log(id);
  try {
    const res = await instance.delete(`${v.DEL_ADMIN}/${id}`)
    return res
  } catch (err) { console.error(err) }
}

export { deleteClient, deleteAdmin, deleteDevice }