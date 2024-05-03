import { useEffect, useState } from 'react'
import { getAdmins } from '@api/Get'

export default function AdminList() {
  const [user, setUsers] = useState([])

  useEffect(() => {
    loadUsers()
  }, [user])

  const loadUsers = async () => {
    try {
      const response = await getAdmins()
      if (response.status === 200) {
        setUsers(response.data.data[0])
      } else {
        console.error('Error al cargar los administradores:', response.statusText)
      }
    } catch (error) {
      console.error('Error al cargar los administradores:', error)
    }
  }

  return (
    <div className="relative overflow-y-auto shadow-md sm:rounded-lg">
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
          </tr>
        </thead>
        <tbody>
            <tr className="bg-white hover:bg-gray-50 cursor-pointer" >
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {user.id}
              </td>
              <td className="px-6 py-4">{user.username}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">{user.password}</td>
            </tr>
        </tbody>
      </table>
    </div>
  )
}