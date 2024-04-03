import { Search } from '../Icons'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getNotifyClient } from '@api/Get'
import { filterNotify } from '@api/Post'

export default function TableNotify() {
  const [ notify, setNotify ] = useState([])
  const [filter, setFilter] = useState({ inicio: '', fin: '' })
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { userId } = router.query
  const id = userId
  const user = parseInt(userId)

  useEffect(() => {
    if (id) {
      loadNotify(id)
    }
  }, [id])

  const loadNotify = async (id) => {
    try {
      setLoading(true)
      const response = await getNotifyClient(id)
      if (response.status == 200) {
        setNotify(response.data.data)
      } else {
        console.log('ha ocurrido un error al cargar las notificaciones')
      }
    } catch (error) {
      console.error('Error al cargar los usuarios:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilter({ ...filter, [name]: value })
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      if (!filter.inicio || !filter.fin) {
        console.error('Las fechas de inicio y fin son requeridas.')
        setLoading(false)
        return
      }
  
      const response = await filterNotify({ userId: id, inicio: filter.inicio, fin: filter.fin })
      if (response.status === 200) {
        setNotifications(response.data.data)
      } else {
        console.error('Error al filtrar las notificaciones por fecha:', response.statusText)
      }
    } catch (error) {
      console.error('Error al filtrar las notificaciones por fecha:', error)
      setLoading(false)
    } 
  }  

  return (
    <>
      <div className="search-head">
        <h1 className="cli">Lista de Notificaciones</h1>
        <form onSubmit={(e) => e.preventDefault()} className="search-noti">
          <input
            className="search-inicio"
            type="text"
            placeholder="Inicio año-mes-dia"
            name="inicio"
            value={filter.inicio}
            onChange={handleInputChange}
          />
          <span className='separator'>/</span>
          <input
            className="search-fin"
            type="text"
            placeholder="Fin año-mes-dia"
            name="fin"
            value={filter.fin}
            onChange={handleInputChange}
          />
          <button className="search" type="button" onClick={handleSearch}>
            <Search />
          </button>
        </form>
      </div>

      <div className="relative overflow-y-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400 bg-blue-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Tipo de Notificacion
              </th>
              <th scope="col" className="px-6 py-3">
                Dispositivo
              </th>
              <th scope="col" className="px-6 py-3">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
          {
            notify.map((noti) => (
              <tr
                key={noti.id}
                className="bg-white hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">{noti.notify_type}</td>
                <td className="px-6 py-4">{noti.id_dispositivo}</td>
                <td className="px-6 py-4">{noti.fecha}</td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
    </>
  )
}