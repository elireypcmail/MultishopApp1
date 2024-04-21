'use client'

import { Profile, Delete, Copy }   from '../Icons'
import { useState, useEffect }     from 'react'
import { setCookie, removeCookie } from '@g/cookies'
import toast, {Toaster}  from 'react-hot-toast'
import { useRouter }     from 'next/router'
import { useDisclosure } from "@nextui-org/react"
import { getUser }       from '@api/Get'
import { deleteClient }  from '@api/Delete'
import { updateUser }    from '@api/Put'
import Image             from 'next/image'
import logo              from '@p/multi2.jpg'
import ModalDev          from '../Dispositivos/Modal'
import ModalMov          from '../Movimientos/Movements'
import MovNotify         from '../Notificaciones/MovNotify'

export default function UserProfile({ data }) {
  const [userData, setUserData] = useState(data)
  const [selectedOptions, setSelectedOptions] = useState({
    est_financiero: userData?.est_financiero,
    suscripcion: userData?.suscripcion
  })

  const notifySucces = (msg) => { toast.success(msg) }
  const notifyError  = (msg) => { toast.error(msg) }
  
  const [filas, setFilas] = useState([
    { telefono: "", mac: "", niv_auth: "", clave: "" },
  ])

  const router = useRouter()
  const { push } = useRouter()

  const {isOpen: isOpenDev, onOpen: onOpenDev, onClose: onCloseDev} = useDisclosure()
  const {isOpen: isOpenMov, onOpen: onOpenMov, onClose: onCloseMov} = useDisclosure()
  const {isOpen: isOpenNot, onOpen: onOpenNot, onClose: onCloseNot} = useDisclosure()

  const { userId } = router.query

  const id = userId

  useEffect(() => {
    setUserData(userData)

    if (id) {
      fetchUserData(id)
    }
  }, [id, userData])

  const fetchUserData = async (id) => {
    try {
      const response = await getUser(id)
      if (response && response.data && response.status === 200) {
        const data = response.data.data
        const profile = {
          id: data?.id,
          identificacion: data?.identificacion,
          nombre: data?.nombre,
          telefono: data?.telefono,
          instancia: data?.instancia,
          est_financiero: data?.est_financiero,
          suscripcion: data?.suscripcion,
          dispositivos: data?.dispositivos
        }

        const Json = JSON.stringify(profile)
        setCookie('profile', Json)

        setUserData(response.data.data)
        setFilas(response.data.data.dispositivos)
      } else {
        console.error('Error al obtener los datos del usuario:', response)
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error)
    }
  }

  const eliminarCliente = async () => {
    try {
      const result = await deleteClient(id)
      if (result.status == 200) {
        removeCookie('profile')
        notifySucces('Se ha eliminado el cliente correctamente')
        push('/client')
      } else { notifyError('Ha ocurrido un error al eliminar este cliente') }
    } catch (err) { console.error(err) }
  }

  const handleDispositivosChange = (dispositivos) => {
    setUserData({ ...userData, dispositivos: dispositivos })
  }

  const eliminarFila = (index) => {
    const nuevasFilas = [...filas]
    nuevasFilas.splice(index, 1)
    setFilas(nuevasFilas)
  }

  async function copiarContenido() {
    try {
      const instancia = document.getElementById('copy').value
      await navigator.clipboard.writeText(instancia)
      notifySucces('Instancia copiada en el portapapeles')
    } catch (err) {
      console.error('Error al copiar: ', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }))
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      const updatedUserData = {
        ...userData,
        est_financiero: selectedOptions.est_financiero,
        suscripcion: selectedOptions.suscripcion,
        dispositivos: filas,
      }
      const response = await updateUser(id, updatedUserData)
      if (response && response.status === 200) {
        notifySucces('Datos actualizados correctamente')
      } else {
        notifyError('Error al actualizar los datos')
      }
    } catch (error) {
      console.error('Error al actualizar los datos:', error)
      notifyError('Error al actualizar los datos')
    }
  }

  return (
    <>
      <div className="main">
        <Toaster position="top-right" reverseOrder={true} duration={5000} />
        <div className="data">
          <div className="profile">
            <div className='pro'>
              <div className="name">
                <Profile />
                <span className='us-pro'>{userData ? userData?.nombre : 'Cargando...'}</span>
              </div>
              <button className='del' onClick={eliminarCliente}>
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
                      <input 
                        className='us2' 
                        type="text" 
                        name="identificacion" 
                        value={userData ? userData?.identificacion : ''} 
                        onChange={handleInputChange} 
                      />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Nombre</label>
                      <input 
                        className='us2' 
                        type="text" 
                        name="nombre" 
                        value={userData ? userData?.nombre : ''} 
                        onChange={handleInputChange} 
                      />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Telefono</label>
                      <input 
                        className='us2' 
                        type="tel" 
                        name="telefono" 
                        value={userData ? userData?.telefono : ''} 
                        onChange={handleInputChange} 
                      />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Estatus financiero</label>
                      <select
                        className="us2"
                        name="est_financiero"
                        value={ selectedOptions ? selectedOptions?.est_financiero : '' }
                        onChange={handleSelectChange}
                      >
                        <option value="">Seleccione</option>
                        <option name="Activo" value="Activo">Activo</option>
                        <option name="Inactivo" value="Inactivo">Inactivo</option>
                      </select>
                    </span>
                  </div>

                  <div className='user2'>
                    <span className='us1'>
                      <label className='labels'>Dirección de instancia</label>
                      <div className="input-with-icon">
                        <input 
                          className='us2' 
                          type="text" 
                          id='copy' 
                          value={userData ? userData?.instancia : ''} 
                          readOnly 
                        />
                        <button type='button' className='copy' onClick={copiarContenido}>
                          <Copy />
                        </button>
                      </div>
                    </span>
                    <span className='us1'>
                      <label className='labels'>Tiempo de suscripción</label>
                      <select
                        className="us2"
                        name="suscripcion"
                        value={ selectedOptions ? selectedOptions?.suscripcion : ''}
                        onChange={handleSelectChange}
                      >
                        <option value="">Seleccione</option>
                        <option value="1">1 (días)</option>
                        <option value="30">30 (días)</option>
                        <option value="40">40 (días)</option>
                      </select>
                    </span>
                    <span className='us1'>
                      <label className='labels'>Dispositivos</label>
                      <button type="button" className="btn4" onClick={onOpenDev}>
                        Ver dispositivos
                      </button>
                      <ModalDev
                        isOpen={isOpenDev}
                        onClose={onCloseDev}
                        dispositivos={userData?.dispositivos}
                        onChange={handleDispositivosChange}
                        eliminarFila={eliminarFila}
                      />
                    </span>
                  </div>
                </div>

                <div className="buttons">
                  <div className='button1'>
                    <button type="button" className='btn2' onClick={handleSave}>Guardar</button>
                    <button type="button" className='btn3' onClick={() => router.push('/client')}>Cerrar</button>
                  </div>
                  <div className="button2">
                    <button type='button' className='btn5 b' onClick={onOpenMov}>Ver movimientos</button>
                    <ModalMov isOpen={isOpenMov} onClose={onCloseMov} />
                    <button type='button' className='btn5' onClick={onOpenNot}>Ver notificaciones</button>
                    <MovNotify isOpen={isOpenNot} onClose={onCloseNot} />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="multi">
            <span>Powered by</span>
            <Image className="mul" src={logo} alt="Logo de multishop" priority />
          </div>
        </div>
      </div>
    </>
  )
}