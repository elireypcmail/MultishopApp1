import instance from '@g/api'
import v from '@g/_var'

async function getUsers() {
  try {
    const res = await instance.get(`${v.ALL_CLIENTS}`)
    return res
  } catch (err) {
    console.error(err)
  }
}

async function getUser(id) {
  try {
    const res = await instance.get(`/user/${id}`)
    return res
  } catch (err) { console.error(err) }
}

async function getNotifyClient(id) {
  try {
    const res = await instance.get(`/notify/${id}`)
    return res
  } catch (err) { console.error(err) }
}

async function getAdmins() {
  try {
    const res = await instance.get(`${v.GET_ADMINS}`)
    console.log(res)
    return res
  } catch (err) {
    console.error(err)
  }
}

export {
  getUsers,
  getUser,
  getNotifyClient,
  getAdmins
}