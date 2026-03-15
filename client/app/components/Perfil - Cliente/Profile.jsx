'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { setCookie, removeCookie } from '@g/cookies'
import { sileo } from "sileo"
import { useRouter } from 'next/router'
import { useDisclosure } from '@nextui-org/react'
import { useUser, useRenovarFechaCorte, useDeleteClient, useUpdateUser } from '@g/queries'
import Image from 'next/image'
import logo from '@p/multi2.png'
import ModalDev from '../Dispositivos/Modal'
import ModalMov from '../Movimientos/Movements'
import MovNotify from '../Notificaciones/MovNotify'
import { format, parse } from 'date-fns'
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
import { isBcryptHash } from '@g/utils'

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

  const notifySucces = (msg) => { sileo.success({ title: msg }) }
  const notifyError = (msg) => { sileo.error({ title: msg }) }

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
  const { data: userResponse, isLoading: isUserLoading, refetch } = useUser(id, { enabled: !!id })
  const renovarFechaMutation = useRenovarFechaCorte()
  const deleteClientMutation = useDeleteClient()
  const updateUserMutation = useUpdateUser()

  useEffect(() => {
    if (!userResponse || userResponse.status !== 200 || !userResponse.data?.data) return

    const dataResponse = userResponse.data.data
    const profile = {
      id: dataResponse?.id,
      identificacion: dataResponse?.identificacion,
      nombre: dataResponse?.nombre,
      telefono: dataResponse?.telefono,
      instancia: dataResponse?.instancia,
      est_financiero: dataResponse?.est_financiero,
      suscripcion: dataResponse?.suscripcion,
      fecha_corte: dataResponse?.fecha_corte,
      dispositivos: dataResponse?.dispositivos,
      type_graph: dataResponse?.type_graph || 'Torta',
    }

    const Json = JSON.stringify(profile)
    setCookie('profile', Json)
    setUserData(dataResponse)
    setFilas(
      dataResponse.dispositivos?.map((e) => {
        const isBcrypt = isBcryptHash(e.clave)
        const currentPassword = !isBcrypt ? e.clave : undefined
        return {
          id: e.id,
          login_user: e.login_user,
          clave: currentPassword,
          currentPassword: e.clave || undefined,
        }
      }),
    )
    setGraphType(dataResponse?.type_graph || 'Torta')
  }, [userResponse])

  const fetchUserData = useCallback(async () => {
    await refetch()
  }, [refetch])

  useEffect(() => {
    if (id) {
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
  }, [id, fetchUserData, m])

  const eliminarCliente = async () => {
    try {
      const result = await deleteClientMutation.mutateAsync(String(id))
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

      const response = await updateUserMutation.mutateAsync({ id: userData.id, data: updatedUserData })

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
                        value={selectedOptions ? selectedOptions?.est_financiero : ''}
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
                        value={selectedOptions ? selectedOptions?.suscripcion : ''}
                        onChange={handleSelectChange}
                      >
                        <option value="">Seleccione</option>
                        <option value="15">15 (días)</option>
                        <option value="25">25 (días)</option>
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
                              const r = await renovarFechaMutation.mutateAsync({ id: data.id, date: data.fecha_corte })
                              if (r.status) {
                                let u = { ...userData }
                                u['est_financiero'] = 'Activo'
                                setSelectedOptions((prevState) => ({
                                  ...prevState,
                                  est_financiero: 'Activo',
                                }));
                                let n = r.newDate.toString()
                                let [y, m, d] = n.split('-').map(Number)
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
                        getDevices={fetchUserData}
                      />
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-between items-center w-full mt-6 mb-5">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-lg font-medium text-white bg-[#146C94] hover:bg-[#115a7a] transition-colors shadow-sm"
                      onClick={handleSave}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors border border-gray-300"
                      onClick={() => router.push('/client')}
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-lg font-medium text-white bg-[#146C94] hover:bg-[#115a7a] transition-colors text-sm"
                      onClick={onOpenMov}
                    >
                      Ver movimientos
                    </button>
                    <ModalMov data={data} isOpen={isOpenMov} onClose={onCloseMov} />
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-lg font-medium text-white bg-[#146C94] hover:bg-[#115a7a] transition-colors text-sm"
                      onClick={onOpenNot}
                    >
                      Ver notificaciones
                    </button>
                    <MovNotify isOpen={isOpenNot} onClose={onCloseNot} />
                    {userData?.identificacion && (
                      <>
                        <button
                          type="button"
                          className="px-4 py-2.5 rounded-lg font-medium text-[#146C94] bg-white border-2 border-[#146C94] hover:bg-[#146C94] hover:text-white transition-colors text-sm"
                          onClick={() => push(`/profile/${id}/api-keys?schema=${encodeURIComponent(userData.identificacion)}`)}
                        >
                          API Keys
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2.5 rounded-lg font-medium text-[#146C94] bg-white border-2 border-[#146C94] hover:bg-[#146C94] hover:text-white transition-colors text-sm"
                          onClick={() => push(`/profile/${id}/jobs?schema=${encodeURIComponent(userData.identificacion)}`)}
                        >
                          Jobs
                        </button>
                      </>
                    )}
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