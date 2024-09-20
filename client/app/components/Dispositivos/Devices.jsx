import { RemoveDevice } from "../Icons"
import { deleteDevice } from '@api/Delete'
import toast from 'react-hot-toast'

export default function TableDev({ dispositivos, onChange }) {
  const notifySucces = (msg) => { toast.success(msg) }

  const handleChange = (e, index) => {
    const { name, value } = e.target
    const nuevosDispositivos = [...dispositivos]
    nuevosDispositivos[index] = { ...nuevosDispositivos[index], [name]: value }
    onChange(nuevosDispositivos)
  }

  const eliminarDispositivo = async (index) => {
    try {
      const dispositivo = dispositivos[index]  
      if (!dispositivo.login_user) {
        console.error("El dispositivo no tiene un login_user válido")
        return
      }
  
      await deleteDevice(dispositivo.login_user) 
      notifySucces('Usuario eliminado')
      const nuevosDispositivos = [...dispositivos]
      nuevosDispositivos.splice(index, 1)
      onChange(nuevosDispositivos)
    } catch (err) {
      console.error('Error al eliminar el dispositivo:', err)
    }
  } 

  const onSave = () => { notifySucces(`Usuario guardado!`) }

  return (
    <div className="lista relative overflow-y-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-center rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-100 uppercase thead">
          <tr>
            <th scope="col" className="px-6 py-3">Nombre de Usuario</th>
            <th scope="col" className="px-6 py-3">Clave</th>
            <th scope="col" className="px-6 py-3"></th>
            <th scope="col" className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {dispositivos.map((dispositivo, index) => (
            <tr className="bg-white hover:bg-gray-50" key={index}>
              <td>
                <input
                  className="block w-full p-2 text-gray-900 border rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  name="login_user"
                  value={dispositivo.login_user}
                  placeholder="Nombre de usuario"
                  onChange={(e) => handleChange(e, index)}
                />
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
              <td>
                <button className="bookmarkBtn" onClick={ onSave }>
                  <span className="IconContainer">
                    <svg viewBox="0 0 384 512" height="0.9em" className="icon">
                      <path
                        d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"
                      ></path>
                    </svg>
                  </span>
                  <p className="text">Guardar</p>
                </button>
              </td>
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