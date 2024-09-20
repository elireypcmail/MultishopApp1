import { useEffect, useState } from 'react'
import { getAdmins }           from '@api/Get'
import { useRouter }           from 'next/router'

export default function AdminList() {
  const [users, setUsers] = useState([])

  const { push } = useRouter()

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

  return (
    <div className="lista relative overflow-y-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-100 uppercase thead head">
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
          {
            users.map((user) => (
              <tr 
                className="bg-white hover:bg-gray-50 cursor-pointer" 
                key={user.id} 
                onClick={() => push(`/profile-admin/${user.id}`)}
              >
                <td className="td-pa px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {user.id}
                </td>
                <td className="td-pa px-6 py-4">{user.username}</td>
                <td className="td-pa px-6 py-4">{user.email}</td>
                <td className="td-pa px-6 py-4">{user.password}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}