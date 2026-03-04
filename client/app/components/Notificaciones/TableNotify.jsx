import { Search } from '../Icons'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useNotifyClient } from '@g/queries'

export default function TableNotify() {
  const [filter, setFilter] = useState({ start: '', end: '' })
  const [debouncedFilter, setDebouncedFilter] = useState(filter)
  useEffect(() => {
    if (filter.start.length === 10 && filter.end.length === 10) {
      const timer = setTimeout(() => {
        setDebouncedFilter(filter)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [filter])

  const router = useRouter()
  const { userId } = router.query
  const id = userId

  const { data } = useNotifyClient(id, debouncedFilter, { enabled: !!id })


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilter({ ...filter, [name]: value })
  }

  const handleSearch = async () => {
    if (!filter.start || !filter.end) {
      console.error('Las fechas de inicio y fin son requeridas.')
      return
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
            placeholder="año-mes-dia"
            name="start"
            value={filter.start}
            onChange={handleInputChange}
          />
          <span className='separator'>/</span>
          <input
            className="search-fin"
            type="text"
            placeholder="año-mes-dia"
            name="end"
            value={filter.end}
            onChange={handleInputChange}
          />
          <button className="search" type="button" onClick={handleSearch}>
            <Search />
          </button>
        </form>
      </div>

      <div className="lista relative overflow-y-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-100 uppercase dark:bg-gray-100 dark:text-gray-400 thead">
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
              <th scope="col" className="px-6 py-3">
                Hora
              </th>
            </tr>
          </thead>
          <tbody>
            {
              data?.data?.data?.map((noti) => {
                const fechaCompleta = new Date(noti?.fecha)

                return (<tr
                  key={noti.id}
                  className="bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4">{noti.notify_type}</td>
                  <td className="px-6 py-4">{noti.id_dispositivo}</td>
                  <td className="px-6 py-4">{fechaCompleta.toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {new Date(noti?.fecha).toLocaleTimeString('es-ES', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }).replace('.', '')}
                  </td>
                </tr>)
              })}
          </tbody>
        </table>
      </div>
    </>
  )
}