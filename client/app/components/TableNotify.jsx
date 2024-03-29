import { Search } from './Icons'

export default function TableNotify() {
  return (
    <>
      <div className="search-head">
        <h1 className="cli">Lista de Notificaciones</h1>
        <form action="" className="search-bar">
          <input className="search-name" type="text" placeholder="AÑO-MES-DIA" />
          <button className="search" type="button">
            <Search />
          </button>
        </form>
      </div>

      <div className="relative overflow-y-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-center rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-blue-400">
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
            <tr className="bg-white hover:bg-gray-50">
              <td>
                <input
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  name="type_noti"
                />
              </td>
              <td>
                <input
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  name="dispositivo"
                />
              </td>
              <td>
                <input
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  name="fecha"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}