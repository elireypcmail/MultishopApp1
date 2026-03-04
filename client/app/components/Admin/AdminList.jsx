import { useEffect } from 'react'
import { useAdmins } from '@g/queries'
import { useRouter } from 'next/router'

export default function AdminList({ admins, updateAdminList }) {
  const { push } = useRouter()

  const { data, isLoading } = useAdmins()

  useEffect(() => {
    if (data?.status === 200 && data.data?.data) {
      updateAdminList(data.data.data)
    }
  }, [data, updateAdminList])



  if (isLoading && !admins.length) {
    return <div>Cargando...</div>
  }

  return (
    <div className="lista relative overflow-y-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-100 uppercase thead head">
          <tr>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">Nombre</th>
            <th scope="col" className="px-6 py-3">Correo</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((user) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}