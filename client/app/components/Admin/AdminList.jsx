import { useEffect, useState } from 'react'
import { getAdmins } from '@api/Get'
import toast, {Toaster}  from 'react-hot-toast'
import { removeCookie } from '@g/cookies'
import { deleteAdmin } from '@api/Delete'
import { RemoveDevice } from "../Icons"

export default function AdminList() {
  const [users, setUsers] = useState([])

  const notifySucces = (msg) => { toast.success(msg) }
  const notifyError  = (msg) => { toast.error(msg) }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await getAdmins()
      if (response.status === 200) {
        setUsers(response.data.data)
      } else {
        console.error('Error al cargar los administradores:', response.statusText)
      }
    } catch (error) {
      console.error('Error al cargar los administradores:', error)
    }
  }

  const eliminarAdmin = async (id) => {
    try {
      const result = await deleteAdmin(id)
      if (result.status === 200) {
        removeCookie('Admin')
        notifySucces('Se ha eliminado el administrador correctamente')
        setUsers(users.filter(user => user.id !== id))
      } else { notifyError('Ha ocurrido un error al eliminar este administrador') }
    } catch (err) { console.error(err) }
  }

  return (
    <div className="relative overflow-y-auto shadow-md sm:rounded-lg">
      <Toaster position="top-right" reverseOrder={true} duration={5000} />
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-sky-100">
          <tr>
            <th scope="col" className="px-6 py-3">
              ID
            </th>
            <th scope="col" className="px-6 py-3">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3">
              Correo
            </th>
            <th scope="col" className="px-6 py-3">
              Clave
            </th>
            <th scope="col" className="px-6 py-3">
              Eliminar
            </th>
          </tr>
        </thead>
        <tbody>
          {
            users.map((user) => (
              <tr className="bg-white hover:bg-gray-50 cursor-pointer" key={user.id} >
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {user.id}
                </td>
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.password}</td>
                <td className="px-6 py-4" onClick={() => eliminarAdmin(user.id)}><RemoveDevice /></td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}