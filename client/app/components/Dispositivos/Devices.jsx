import { useState } from "react"
import { RemoveDevice } from "../Icons"
import { useRouter } from "next/router"
import { updateUser } from "@api/Put"
import { deleteDevice } from '@api/Delete'
import toast from 'react-hot-toast'

export default function TableDev({ dispositivos, onChange }) {
  const router = useRouter()
  const notifySuccess = (msg) => { toast.success(msg) }
  const notifyError = (msg) => { toast.error(msg) }

  const { userId } = router.query

  const handleChange = (e, index) => {
    const { name, value } = e.target
    const nuevosDispositivos = [...dispositivos]
    nuevosDispositivos[index] = { ...nuevosDispositivos[index], [name]: value.toUpperCase() }
    onChange(nuevosDispositivos)
  }

  const eliminarDispositivo = async (index) => {
    const dispositivo = dispositivos[index]
    
    // Si los campos están en blanco, simplemente elimina la fila sin llamar a la API
    if (!dispositivo.login_user && !dispositivo.clave) {
      const nuevosDispositivos = dispositivos.filter((_, idx) => idx !== index)
      onChange(nuevosDispositivos)
      notifySuccess('Fila eliminada')
      return
    }

    // Si hay un login_user, procede con la eliminación normal
    if (dispositivo.login_user) {
      try {
        await deleteDevice(dispositivo.login_user)
        notifySuccess('Usuario eliminado')
        const nuevosDispositivos = dispositivos.filter((_, idx) => idx !== index)
        onChange(nuevosDispositivos)
      } catch (err) {
        console.error('Error al eliminar el dispositivo:', err)
        notifyError('Error al eliminar el usuario')
      }
    } else {
      // Si no hay login_user pero hay otros datos, elimina la fila localmente
      const nuevosDispositivos = dispositivos.filter((_, idx) => idx !== index)
      onChange(nuevosDispositivos)
      notifySuccess('Fila eliminada')
    }
  }

  const onSave = async () => {
    try {
      // Filtrar dispositivos vacíos antes de enviar
      const dispositivosValidos = dispositivos.filter(d => d.login_user || d.clave)
      const response = await updateUser(userId, { dispositivos: dispositivosValidos })
      if (response && response.status === 200 && response.data.message === 'Datos del usuario y dispositivos actualizados correctamente.') {
        notifySuccess('Usuarios guardados correctamente')
        // Actualizar la lista de dispositivos para eliminar las filas vacías
        onChange(dispositivosValidos)
      } else if (response && response.data.message && response.data.message.includes('ya existe')) {
        notifyError(`Error: ${response.data.message}`)
        
        const existingLoginUser = response.data.message.split("'")[1]
        const existingDeviceIndex = dispositivos.findIndex(d => d.login_user === existingLoginUser)
        
        if (existingDeviceIndex !== -1) {
          setTimeout(() => {
            const nuevosDispositivos = [...dispositivos]
            nuevosDispositivos[existingDeviceIndex] = { login_user: '', clave: '' }
            onChange(nuevosDispositivos)
          }, 1000)
        }
      } else {
        notifyError('Error al guardar los usuarios')
      }
    } catch (error) {
      console.error('Error al guardar los usuarios:', error)
      notifyError('Error al guardar los usuarios')
    }
  }

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
                <button className="bookmarkBtn" onClick={onSave}>
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