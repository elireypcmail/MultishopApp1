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
    return res
  } catch (err) { console.error(err) }
}

async function getAdmin(id) {
  try {
    const res = await instance.get(`${v.GET_ADMIN}/${id}`)
    return res
  } catch (err) { console.error(err) }
}

async function getMove(id) {
  try {
    const res = await instance.get(`${v.GET_MOVES}/${id}`)
    return res
  } catch (err) { console.error(err) }
}

export {
  getUsers,
  getUser,
  getNotifyClient,
  getAdmins,
  getAdmin,
  getMove
}