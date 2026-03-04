import instance from '@g/api'

async function deleteClient(id) {
  try {
    const res =  await instance.delete(`/clients/${id}`)
    return res
  } catch (err) { 
    if(err?.response){
      return {data: err?.response?.data}
    }
  }
}

const deleteDevice = async (login_user) => {
  try {
    const res = await instance.delete(`/clients/device/${login_user}`)
    return res
  } catch (err) {
    if(err?.response){
      return {data: err?.response?.data}
    }
  }
}

async function deleteAdmin(id) {
  try {
    const res = await instance.delete(`/users/${id}`)
    return res
  } catch (err) { 
    if(err?.response){
      return {data: err?.response?.data}
    }
  }
}

export { deleteClient, deleteAdmin, deleteDevice }