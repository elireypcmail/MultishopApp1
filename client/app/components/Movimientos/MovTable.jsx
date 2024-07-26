import { Search } from "../Icons"
import { useState, useEffect } from "react"
import { getMove } from "@api/Get"
import { filterMove } from "@api/Post"  // Asegúrate de importar tu función de filtrado
import { useRouter } from "next/router"

export default function MovTable({ data }) {
  const [move, setMove] = useState([])
  const [filter, setFilter] = useState({ inicio: '', fin: '' })
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { userId } = router.query
  const id = userId

  useEffect(() => {
    if (id) {
      loadMove(id)
    }
  }, [id])

  const loadMove = async (id) => {
    try {
      setLoading(true)
      const response = await getMove(id)
      if (response.status === 200) {
        setMove(response.data.data)
      } else {
        console.error('Ha ocurrido un error al cargar los movimientos')
      }
    } catch (error) {
      console.error('Error al cargar los movimientos:', error)
    } finally {
      setLoading(false)
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
      const response = await filterMove({ id, inicio: filter.inicio, fin: filter.fin })
      if (response.status === 200) {
        setMove(response.data.data)
      } else {
        console.error('Error al filtrar los movimientos por fecha:', response.statusText)
      }
    } catch (error) {
      console.error('Error al filtrar los movimientos por fecha:', error)
    } finally {
      setLoading(false)
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
            name="inicio"
            value={filter.inicio}
            onChange={handleInputChange}
          />
          <span className='separator'>/</span>
          <input
            className="search-fin"
            type="text"
            placeholder="año-mes-dia"
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
        <table className="w-full text-sm text-center rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-100 uppercase thead">
            <tr>
              <th scope="col" className="px-6 py-3">Acción</th>
              <th scope="col" className="px-6 py-3">Dispositivo</th>
              <th scope="col" className="px-6 py-3">Información adicional</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {move.map((move) => (
              <tr className="bg-white hover:bg-gray-50 cursor-pointer" key={move.id}>
                <td className="px-6 py-4">{move?.accion}</td>
                <td className="px-6 py-4">{move?.id_dispositivo}</td>
                <td className="px-6 py-4">
                  {renderAdditionalInfo(move?.additional_info)}
                </td>
                <td className="px-6 py-4">{new Date(move?.fecha).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}