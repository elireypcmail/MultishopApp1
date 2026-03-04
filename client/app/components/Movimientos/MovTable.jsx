import { Search } from "../Icons"
import { useState, useEffect } from "react"
import { useMoves } from "@g/queries"
import { useRouter } from "next/router"

export default function MovTable({ data }) {
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

  const { data: movesResponse } = useMoves(id, debouncedFilter, { enabled: !!id })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilter({ ...filter, [name]: value })
  }

  const handleSearch = async () => {
    if (!filter.inicio || !filter.fin) {
      console.error('Las fechas de inicio y fin son requeridas.')
      return
    }
  }

  const renderAdditionalInfo = (info) => {
    if (!info) {
      return "No hay información adicional"
    }
    return Object.keys(info).map(key => (
      <div key={key}>
        <strong>{key}</strong>: {info[key]}
      </div>
    ))
  }

  return (
    <>
      <div className="search-head">
        <h1 className="cli">Lista de Movimientos</h1>
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
        <table className="w-full text-sm text-center rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-100 uppercase thead">
            <tr>
              <th scope="col" className="px-6 py-3">Acción</th>
              <th scope="col" className="px-6 py-3">Usuario</th>
              <th scope="col" className="px-6 py-3">Información adicional</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
              <th scope="col" className="px-6 py-3">Hora de Inicio</th>
            </tr>
          </thead>
          <tbody>
            {movesResponse?.data?.data?.map((move) => {
              const fechaCompleta = new Date(move?.fecha)
              return (
                <tr className="bg-white hover:bg-gray-50 cursor-pointer" key={move.id}>
                  <td className="px-6 py-4">{move?.accion}</td>
                  <td className="px-6 py-4">{move?.id_dispositivo}</td>
                  <td className="px-6 py-4">
                    {renderAdditionalInfo(move?.additional_info)}
                  </td>
                  <td className="px-6 py-4">{fechaCompleta.toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {new Date(move?.fecha).toLocaleTimeString('es-ES', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }).replace('.', '')}
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
