'use client'

import { Profile, Delete, Copy } from '../Icons'
import { useState, useEffect }   from 'react'
import toast, {Toaster}  from 'react-hot-toast'
import { useRouter }     from 'next/router'
import { useDisclosure } from "@nextui-org/react"
import { useDispatch } from 'react-redux'
import { seeDataClient } from '@g/redux/slicers/clientSlicer'
import { getUser }       from '@api/Get'
import { deleteClient }  from '@api/Delete'
import Image             from 'next/image'
import logo              from '@p/multi2.jpg'
import ModalDev          from '../Dispositivos/Modal'
import ModalMov          from '../Movimientos/Movements'
import MovNotify         from '../Notificaciones/MovNotify'

export default function UserProfile() {
  const dispatch = useDispatch()

  const [userData, setUserData] = useState({})
  const [selectedOptions, setSelectedOptions] = useState({
    est_financiero: '',
    suscripcion: ''
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
    if (id) {
      fetchUserData(id)
    }
  }, [])

  const fetchUserData = async (id) => {
    try {
      const response = await getUser(id)
      if (response && response.data && response.status === 200) {
        const data = response?.data?.data
        dispatch(seeDataClient({ 
          id: data?.id,
          identificacion: data?.identificacion,
          nombre: data?.nombre,
          telefono: data?.telefono,
          instancia: data?.instancia,
          est_financiero: data?.est_financiero,
          suscripcion: data?.suscripcion,
          dispositivos: data?.dispositivos
        }))

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
      console.log('Contenido copiado al portapapeles')
    } catch (err) {
      console.error('Error al copiar: ', err)
    }
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setSelectedOptions(prevState => ({ ...prevState, [name]: value }))
  }

  const handleSave = () => {
    console.log('Datos actualizados:', userData, selectedOptions, filas)
  }

  return (
    <>
      <div className="main">
      <Toaster position="top-right" reverseOrder={true} duration={5000}/>
        <div className="data">
          <div className="profile">
            <div className='pro'>
              <div className="name">
                <Profile />
                <span className='us-pro'>{userData.nombre}</span>
              </div>
              <button className='del' onClick={ eliminarCliente }>
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
                      <input className='us2' type="text" value={userData.identificacion} readOnly />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Nombre</label>
                      <input className='us2' type="text" value={userData.nombre} readOnly />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Telefono</label>
                      <input className='us2' type="tel" value={userData.telefono} readOnly />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Estatus financiero</label>
                      <select
                        className="us2"
                        name="est_financiero"
                        value={userData.est_financiero}
                        onChange={handleSelectChange}
                      >
                        <option value="">Seleccione</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </span>
                  </div>

                  <div className='user2'>
                    <span className='us1'>
                      <label className='labels'>Dirección de instancia</label>
                      <div className="input-with-icon">
                        <input className='us2' type="text" id='copy' value={userData.instancia} readOnly />
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
                        value={userData.suscripcion}
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
                      <ModalDev isOpen={isOpenDev} onClose={onCloseDev} dispositivos={userData.dispositivos} onChange={handleDispositivosChange} eliminarFila={eliminarFila} />
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