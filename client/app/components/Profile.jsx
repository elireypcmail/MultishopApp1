import { Profile, Delete, Copy } from './Icons'
import Image from 'next/image'
import logo from '@p/multi2.jpg'
import { useDisclosure } from "@nextui-org/react"
import ModalDev from './Modal'
import ModalMov from './Movements'
import MovNotify from './MovNotify'
import { useState, useRef } from 'react'

export default function UserProfile() {
  const {isOpen: isOpenDev, onOpen: onOpenDev, onClose: onCloseDev} = useDisclosure()
  const {isOpen: isOpenMov, onOpen: onOpenMov, onClose: onCloseMov} = useDisclosure()
  const {isOpen: isOpenNot, onOpen: onOpenNot, onClose: onCloseNot} = useDisclosure()

  const [filas, setFilas] = useState([
    { telefono: "", mac: "", niv_auth: "", clave: "" },
  ])

  const inputDireccionRef = useRef(null)

  const eliminarFila = (index) => {
    const nuevasFilas = [...filas]
    nuevasFilas.splice(index, 1)
    setFilas(nuevasFilas)
  }

  async function copiarContenido() {
    try {
      const instancia = document.getElementById('copy').value

      await navigator.clipboard.writeText(instancia)
      console.log('Contenido copiado al portapapeles')
    } catch (err) {
      console.error('Error al copiar: ', err)
    }
  }

  return(
    <>
      <div className="main">
        <div className="data">
          <div className="profile">
            <div className='pro'>
              <div className="name">
                <Profile />
                <span className='us-pro'>Panificadora</span>
              </div>
              <button className='del'>
                  <span className='delete'>Eliminar</span>
                  <Delete />
              </button>
            </div>

            <div className='us'>
              <form action="" className='form-us'>
                <div className="forms">
                  <div className="user1">
                    <span className='us1'>
                      <label className='labels'>Identificación</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Nombre</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Telefono</label>
                      <input className='us2' type="tel" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Estatus financiero</label>
                      <input className='us2' type="text" />
                    </span>
                  </div>

                  <div className='user2'>
                    <span className='us1'>
                      <label className='labels'>Dirección de instancia</label>
                      <div className="input-with-icon">
                        <input className='us2' type="text" id='copy' />
                        <button type='button' className='copy' onClick={() => { copiarContenido() }}>
                          <Copy />
                        </button>
                      </div>
                    </span>
                    <span className='us1'>
                      <label className='labels'>Estatus de seguridad</label>
                      <select
                        className="us2 option text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="nivel1">Seleccione</option>
                        <option value="nivel1">Activo</option>
                        <option value="nivel2">Inactivo</option>
                      </select>
                    </span>
                    <span className='us1'>
                      <label className='labels'>Tiempo de suscripción</label>
                      <select
                        className="us2 option text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="nivel1">Seleccione</option>
                        <option value="nivel1">30 (días)</option>
                        <option value="nivel1">40 (días)</option>
                      </select>
                    </span>
                    <span className='us1'>
                      <label className='labels'>Dispositivos</label>
                      <button type="button" className="btn4" onClick={onOpenDev}>
                        Ver dispositivos
                      </button>
                      <ModalDev isOpen={isOpenDev} onClose={onCloseDev} eliminarFila={eliminarFila} />
                    </span>
                  </div>
                </div>

                <div className="buttons">
                  <div className='button1'>
                    <button type="button" className='btn2'>Guardar</button>
                    <button type="button" className='btn3'>Cerrar</button>
                  </div>
                  <div className="button2">
                    <button type='button' className='btn5 b' onClick={onOpenMov}>Ver movimientos</button>
                    <ModalMov isOpen={isOpenMov} onClose={onCloseMov}  />
                    <button type='button' className='btn5' onClick={onOpenNot}>Ver notificaciones</button>
                    <MovNotify isOpen={isOpenNot} onClose={onCloseNot}  />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="multi">
            <span>Powered by</span>
            <Image className="mul" src={ logo } alt="Logo de multishop" priority />
          </div>
        </div>
      </div>
    </>
  )
}