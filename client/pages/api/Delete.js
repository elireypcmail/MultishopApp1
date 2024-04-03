import instance from '@g/api'
import v        from '@g/_var'

async function deleteClient(id) {
  try {
    const res =  await instance.delete(`${v.DEL_CLIENT}/${id}`)
    console.log(res)
    return res
  } catch (err) { console.error(err) }
}

export { deleteClient }