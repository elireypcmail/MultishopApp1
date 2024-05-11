import { useState } from 'react';
import { RemoveDevice } from "../Icons";

export default function TableDev({ dispositivos, onChange }) {
  const [telefonoError, setTelefonoError] = useState('')

  const handleChange = (e, index) => {
    const { name, value } = e.target

    if (name === 'telefono') {
      if (!/^(\+58\s)?\d{10}$/.test(value)) {
        setTelefonoError('Formato incorrecto de número de teléfono')
      } else {
        setTelefonoError('')
      }
    }

    const nuevosDispositivos = [...dispositivos]
    nuevosDispositivos[index][name] = value
    onChange(nuevosDispositivos)
  }

  const eliminarDispositivo = (index) => {
    const nuevosDispositivos = [...dispositivos]
    nuevosDispositivos.splice(index, 1)
    onChange(nuevosDispositivos)
  }

  return (
    <div className="relative overflow-y-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-center rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-100 uppercase thead">
          <tr>
            <th scope="col" className="px-6 py-3">
              Telefono
            </th>
            <th scope="col" className="px-6 py-3">
              Nivel de Autorización
            </th>
            <th scope="col" className="px-6 py-3">
              Clave
            </th>
            <th scope="col" className="px-6 py-3"></th>
            <th scope="col" className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {dispositivos.map((dispositivo, index) => (
            <tr className="bg-white hover:bg-gray-50" key={index}>
              <td>
                <input
                  className={`block w-full p-2 text-gray-900 border ${telefonoError ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  type="tel"
                  name="telefono"
                  value={dispositivo.telefono}
                  onChange={(e) => handleChange(e, index)}
                />
                {telefonoError && (
                  <p className="text-red-500 text-xs">{telefonoError}</p>
                )}
              </td>
              <td>
                <select
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  name="rol"
                  value={dispositivo.rol}
                  onChange={(e) => handleChange(e, index)}
                >
                  <option value="selecc">Seleccionar</option>
                  <option value="rol1">rol1</option>
                  <option value="rol2">rol2</option>
                  <option value="rol3">rol3</option>
                </select>
              </td>
              <td>
                <input
                  className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  name="clave"
                  value={dispositivo.clave}
                  onChange={(e) => handleChange(e, index)}
                />
              </td>
              <td><input type="checkbox" /></td>
              <td>
                <button className="remove" onClick={() => eliminarDispositivo(index)}>
                  <RemoveDevice />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}