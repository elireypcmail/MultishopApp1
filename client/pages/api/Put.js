import instance from '@g/api'

async function updateUser(id, data) {
  try {
    const res = await instance.patch(`/clients/${id}`, data)
    return res
  } catch (err) { 
    if(err?.response){
      return {data: err?.response?.data}
    }
   }
}

async function updateState(id) {
  try {
    const res = await instance.put(`/clients/${id}/inactivate`)
    return res
  } catch (err) { 
    if(err?.response){
      return {data: err?.response?.data}
    }
   }
}

async function updateAdmin(id, data) {
  try {
    const res = await instance.patch(`/users/${id}`, data)
    return res
  } catch (err) { 
    if(err?.response){
      return {data: err?.response?.data}
    }
   }
}

export { updateUser, updateAdmin, updateState }