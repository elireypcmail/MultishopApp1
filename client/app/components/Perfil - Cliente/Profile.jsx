'use client'

import { useState, useEffect, useRef } from 'react'
import { setCookie, removeCookie }     from '@g/cookies'
import toast, { Toaster }              from 'react-hot-toast'
import { useRouter }                   from 'next/router'
import { useDisclosure }               from '@nextui-org/react'
import { getUser }                     from '@api/Get'
import { renovarFechaCorte }           from '@api/Post'
import { deleteClient }                from '@api/Delete'
import { updateUser }                  from '@api/Put'
import Image                           from 'next/image'
import logo                            from '@p/multi2.png'
import ModalDev                        from '../Dispositivos/Modal'
import ModalMov                        from '../Movimientos/Movements'
import MovNotify                       from '../Notificaciones/MovNotify'
import { format, parse }               from 'date-fns'
import { 
  Profile, 
  Delete, 
  Copy, 
  BarGraph, 
  CircularGraph, 
  LineGraph 
} from '../Icons'
import {
  getDaysDifference,
  parseDateFromDDMMYYYY,
} from '@g/dateComparison'

export default function UserProfile({ data }) {
  const [userData, setUserData] = useState(data)
  const [valid, setValid] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState({
    est_financiero: userData?.est_financiero,
    suscripcion: userData?.suscripcion,
  })
  const [graphType, setGraphType] = useState(data?.type_graph || 'Torta')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  let p = parseDateFromDDMMYYYY(data?.fecha_corte)
  let m = getDaysDifference(p)

  const notifySucces = (msg) => { toast.success(msg) }
  const notifyError  = (msg) => { toast.error(msg) }

  const [filas, setFilas] = useState([
    { telefono: '', mac: '', niv_auth: '', clave: '' },
  ])

  const router = useRouter()
  const { push } = useRouter()

  const { isOpen: isOpenDev, onOpen: onOpenDev, onClose: onCloseDev } = useDisclosure()
  const { isOpen: isOpenMov, onOpen: onOpenMov, onClose: onCloseMov } = useDisclosure()
  const { isOpen: isOpenNot, onOpen: onOpenNot, onClose: onCloseNot } = useDisclosure()

  const { userId } = router.query

  const id = userId

  useEffect(() => {
    if (id) {
      fetchUserData(id)
      setValid(typeof m != 'boolean' && m > 0 ? true : false)
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [id])

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
          fecha_corte: data?.fecha_corte,
          dispositivos: data?.dispositivos,
          type_graph: data?.type_graph || 'Torta',
        }

        const Json = JSON.stringify(profile)
        setCookie('profile', Json)

        setUserData(response.data.data)
        setFilas(response.data.data.dispositivos)
        setGraphType(data?.type_graph || 'Torta')
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
      if (result.status === 200) {
        removeCookie('profile')
        notifySucces('Se ha eliminado el cliente correctamente')
        push('/client')
      } else {
        notifyError('Ha ocurrido un error al eliminar este cliente')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDispositivosChange = (nuevosDispositivos) => {
    setFilas(nuevosDispositivos)
    setUserData((prevUserData) => ({
      ...prevUserData,
      dispositivos: nuevosDispositivos,
    }))
  }

  const agregarDispositivo = () => {
    const nuevosDispositivos = [...filas, { telefono: '', mac: '', niv_auth: '', clave: '' }]
    handleDispositivosChange(nuevosDispositivos)
  }

  const eliminarFila = (index) => {
    const nuevasFilas = filas.filter((_, idx) => idx !== index)
    handleDispositivosChange(nuevasFilas)
  }

  const copiarContenido = async () => {
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
    if (name === 'fecha_corte') {
      const date = parse(value, 'yyyy-MM-dd', new Date())
      const formattedDate = format(date, 'dd/MM/yyyy')
      setUserData(prevData => ({
        ...prevData,
        [name]: formattedDate
      }))
    } else {
      setUserData(prevData => ({
        ...prevData,
        [name]: value
      }))
    }
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
        type_graph: graphType,
      }
      
      const response = await updateUser(userData.id, updatedUserData)
      
      if (response && response.status === 200 && response.data.message === 'Datos del usuario y dispositivos actualizados correctamente.') {
        notifySucces('Datos actualizados correctamente')
        setUserData(updatedUserData)
      } else {
        notifyError('Error al actualizar los datos')
      }
    } catch (error) {
      console.error('Error al actualizar los datos:', error)
      notifyError('Error al actualizar los datos')
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleGraphTypeChange = (type) => {
    setGraphType(type)
    setIsDropdownOpen(false)
  }

  const renderGraphIcon = () => {
    switch (graphType) {
      case 'Torta':
        return <CircularGraph className="w-5 h-5" />
      case 'Barra':
        return <BarGraph className="w-5 h-5" />
      case 'Línea':
        return <LineGraph className="w-5 h-5" />
      default:
        return <CircularGraph className="w-5 h-5" />
    }
  }

  const graphOptions = [
    { type: 'Torta', icon: CircularGraph },
    { type: 'Barra', icon: BarGraph },
    { type: 'Línea', icon: LineGraph },
  ].filter(option => option.type !== graphType)

  return (
    <>
      <div className="main">
        <Toaster position="top-right" reverseOrder={true} duration={5000} />
        <div className="data">
          <div className="profile">
          <div className='pro'>
            <div className="name flex items-center">
              <Profile />
              <span className='us-pro ml-2'>{userData ? userData?.nombre : 'Cargando...'}</span>
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="text-white font-medium rounded-lg text-sm px-3 py-2.5 text-center inline-flex items-center"
                  type="button"
                >
                  {renderGraphIcon()}
                </button>
                {isDropdownOpen && (
                  <div className="z-10 absolute left-0 mt-2 bg-[#fcfcfccf] divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                    <ul className="py-2 px-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownRightEndButton">
                      {graphOptions.map((option) => (
                        <li key={option.type}>
                          <button
                            onClick={() => handleGraphTypeChange(option.type)}
                            className="flex items-center w-full px-4 py-2 hover:bg-[rgba(209,213,219,0.31)] dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            <option.icon className="mr-3 h-5 w-5" />
                            {option.type}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
                          value={userData ? userData?.identificacion : ''} 
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
                        <option value="35">35 (días)</option>
                        <option value="45">45 (días)</option>
                        <option value="65">65 (días)</option>
                      </select>
                    </span>
                    <span className='us1'>
                      <label className='labels'>Fecha de corte de la suscripción</label>
                      <div className='flex gap-[10px] items-start'>
                        <input 
                          className='us2 w-full'
                          type="date"
                          name="fecha_corte"
                          value={userData?.fecha_corte ? format(parse(userData.fecha_corte, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') : ''}
                          onChange={handleInputChange} 
                        />
                        {valid && (
                          <button
                            type='button'
                            className='bg-[#146C94] text-white h-[55px] px-[12px] rounded-[5px]'
                            onClick={async (e) => {
                              e.preventDefault()
                              const r = await renovarFechaCorte(data.id, data.fecha_corte)
                              if (r.status) {
                                let u = { ...userData }
                                u['est_financiero'] = 'Activo'
                                let n = r.newDate.toString()
                                let [y,m,d] = n.split('-').map(Number)
                                u['fecha_corte'] = `${d}/${m}/${y}`
                                setUserData(u)
                                setValid(false)
                              }
                            }}
                          >
                            Renovar
                          </button>
                        )}
                      </div>
                    </span>
                    <span className='us1'>
                      <label className='labels'>Dispositivos</label>
                      <button type="button" className="btn4" onClick={onOpenDev}>
                        Ver usuarios
                      </button>
                      <ModalDev
                        isOpen={isOpenDev}
                        onClose={onCloseDev}
                        dispositivos={filas}
                        onChange={handleDispositivosChange}
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
                    <ModalMov data={data} isOpen={isOpenMov} onClose={onCloseMov} />
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