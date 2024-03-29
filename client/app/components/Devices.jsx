import { RemoveDevice } from "./Icons"

export default function DevicesTable({ filas, setFilas }) {
  const handleChange = (e, index) => {
    const { name, value } = e.target
    const nuevasFilas = [...filas]
    nuevasFilas[index][name] = value
    setFilas(nuevasFilas)
  }

  const eliminarFila = (index) => {
    const nuevasFilas = [...filas]
    nuevasFilas.splice(index, 1)
    setFilas(nuevasFilas)
  }

  // Eliminar y añadir filas usando el id
  /* const handleChange = (e, id) => {
    const { name, value } = e.target
    const nuevasFilas = filas.map(fila =>
      fila.id === id ? { ...fila, [name]: value } : fila
    )
    setFilas(nuevasFilas)
  }

  const eliminarFila = (id) => {
    const nuevasFilas = filas.filter(fila => fila.id !== id)
    setFilas(nuevasFilas)
  } */

  return (
    <div className="relative overflow-y-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-center rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-blue-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Telefono
            </th>
            <th scope="col" className="px-6 py-3">
              MAC
            </th>
            <th scope="col" className="px-6 py-3">
              Nivel de Autorización
            </th>
            <th scope="col" className="px-6 py-3">
              Clave
            </th>
            <th scope="col" className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {
            filas.map((fila, index) => (
              <tr className="bg-white hover:bg-gray-50" key={index}>
                <td>
                  <input
                    className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    type="tel"
                    name="telefono"
                    value={fila.telefono}
                    onChange={(e) => { handleChange(e, index) }}
                  />
                </td>
                <td>
                  <input
                    className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    type="text"
                    name="mac"
                    value={fila.mac}
                    onChange={(e) => { handleChange(e, index) }}
                  />
                </td>
                <td>
                  <select
                    className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    name="niv_auth"
                    value={fila.niv_auth}
                    onChange={(e) => handleChange(e, index)}
                  >
                    <option value="nivel1">Seleccione</option>
                    <option value="nivel1">Nivel 1</option>
                    <option value="nivel2">Nivel 2</option>
                    <option value="nivel3">Nivel 3</option>
                  </select>
                </td>
                <td>
                  <input
                    className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    type="text"
                    name="clave"
                    value={fila.clave}
                    onChange={(e) => { handleChange(e, index) }}
                  />
                </td>
                <td>
                  <button className="remove" onClick={() => eliminarFila(index)}>
                    <RemoveDevice />
                  </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}