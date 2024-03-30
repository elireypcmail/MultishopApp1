import instance from '@g/api'
import v from '@g/_var'

async function registroCliente(data) {
  try {
    const res = await instance.post(`${v.REGISTRO_C}`, data)
    return res
  } catch (err) { console.error(err) }
}

async function registroAdmin(data) {
  try {
    const res = await instance.post(`${v.REGISTRO_A}`, data)
    return res
  } catch (err) { console.error(err) }
}

async function loginAdmin(data) {
  try {
    const res = await instance.post(`${v.LOGIN_ADMIN}`, data)
    console.log(res)
    return res
  } catch (err) { console.error(err) }
}

export { 
  registroCliente,
  registroAdmin,
  loginAdmin,
}