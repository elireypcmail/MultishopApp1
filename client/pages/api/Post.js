import instance from '@g/api'
import v from '@g/_var'

async function registroCliente(data) {
  try {
    const res = await instance.post(`${v.REGISTRO_C}`, data)
    return { success: true, data: res.data } 
  } catch (err) { 
    console.error(err)
    return { success: false, error: err } 
  }
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
    return res
  } catch (err) { console.error(err) }
}

async function filtrarClientesPorLetra(letra) {
  try {
    const res = await instance.post(`${v.FILTER_CLI}`, {letra})
    return res
  } catch (err) { console.error(err) }
}

async function filterNotify(fecha) {
  try {
    const res = await instance.post(`/find`, fecha)
    console.log(res)
    return res
  } catch (err) { console.error(err) }
}

export { 
  registroCliente,
  registroAdmin,
  loginAdmin,
  filtrarClientesPorLetra,
  filterNotify
}