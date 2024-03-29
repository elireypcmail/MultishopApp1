import instance from '@g/api'

const v = {
  REGISTRO_C: process.env.NEXT_PUBLIC_REGISTRO_CLIENTE,

}

async function registroCliente(data) {
  try {
    const res = await instance.post('/create/user', data)
    console.log(res)
    return res
  } catch (err) {
    console.error(err)
  }
}

export { 
  registroCliente,
}