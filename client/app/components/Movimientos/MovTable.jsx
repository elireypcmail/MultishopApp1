import { Search } from "../Icons"

export default function MovTable() {
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
          />
          <span className='separator'>/</span>
          <input
            className="search-fin"
            type="text"
            placeholder="año-mes-dia"
            name="fin"
          />
          <button className="search" type="button">
            <Search />
          </button>
        </form>
      </div>

      <div className="relative overflow-y-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-center rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-100 uppercase thead">
            <tr>
              <th scope="col" className="px-6 py-3">
                Tipo de movimiento
              </th>
              <th scope="col" className="px-6 py-3">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white hover:bg-gray-50 cursor-pointer">
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}