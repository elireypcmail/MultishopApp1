import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getUsers } from '@api/Get'

export default function UserTable({ searchResults }) {
  const [users, setUsers] = useState([])
  const { push } = useRouter()

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setUsers(searchResults)
    } else {
      loadUsers()
    }
  }, [searchResults])

  const loadUsers = async () => {
    try {
      const response = await getUsers()
      if (response.status === 200) {
        setUsers(response.data.data)
      } else {
        console.error('Error al cargar los usuarios:', response.statusText)
      }
    } catch (error) {
      console.error('Error al cargar los usuarios:', error)
    }
  }

  const displayUsers = searchResults.length > 0 ? searchResults : users

  return (
    <div className="lista relative overflow-y-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-100 uppercase thead head">
          <tr>
            <th scope="col" className="px-6 py-3">
              ID
            </th>
            <th scope="col" className="px-6 py-3">
              Identificación
            </th>
            <th scope="col" className="px-6 py-3">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {displayUsers.map((user) => (
            <tr
              key={user.id}
              className="bg-white hover:bg-gray-50 cursor-pointer"
              onClick={() => push(`/profile/${user.id}`)}
            >
              <td className="td px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {user.id}
              </td>
              <td className="td-pa px-6 py-4">{user.identificacion}</td>
              <td className="td-pa px-6 py-4">{user.nombre}</td>
              <td className="td-pa px-6 py-4">{user.est_financiero}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}