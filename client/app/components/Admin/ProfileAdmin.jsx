'use client'

import { Profile, Delete } from '../Icons'
import { useState, useEffect } from 'react'
import { setCookie, removeCookie } from '@g/cookies'
import { sileo } from "sileo"
import { useRouter } from 'next/router'
import { useAdmin, useAdminByEmail, useDeleteAdmin, useUpdateAdmin } from '@g/queries'
import Image from 'next/image'
import logo from '@p/multi2.png'
import { isBcryptHash } from '../../../pages/utils'

export default function AdminProfile({ data }) {
  const [userData, setUserData] = useState(() => ({
    username: '',
    email: '',
    password: '',
    ...data,
  }))
  const [isLoading, setIsLoading] = useState(true)

  const notifySuccess = (msg) => { sileo.success({ title: msg }) }
  const notifyError = (msg) => { sileo.error({ title: msg }) }

  const router = useRouter()
  const { id, email } = router.query
  const { data: adminById } = useAdmin(id, { enabled: !!id })
  const { data: adminByEmailData } = useAdminByEmail(email, { enabled: !!email && !id })
  const deleteAdminMutation = useDeleteAdmin()
  const updateAdminMutation = useUpdateAdmin()

  useEffect(() => {
    if (!id && !email) {
      setIsLoading(false)
      return
    }

    const response = id ? adminById : adminByEmailData
    if (!response) return

    if (response && response.data && response.status === 200) {
      const data = response.data.data
      const profileAdmin = {
        id: data.id,
        username: data.username,
        email: data.email,
        password: data.password,
      }

      const Json = JSON.stringify(profileAdmin)
      setCookie('profileAdmin', Json)

      const isBcrypt = isBcryptHash(data.password)
      const currentPassword = !isBcrypt ? data.password : undefined

      setUserData({
        id: data.id,
        username: data.username,
        email: data.email,
        password: currentPassword,
      })
    } else {
      console.error('Error al obtener los datos del administrador:', response)
      notifyError('Error al obtener los datos del administrador')
    }

    setIsLoading(false)
  }, [id, email, adminById, adminByEmailData])



  const eliminarAdmin = async () => {
    try {
      const result = await deleteAdminMutation.mutateAsync(userData.id)
      if (result) {
        removeCookie('Admin')
        notifySuccess('Se ha eliminado el administrador correctamente')
        router.push('/admins')
      } else {
        notifyError('Ha ocurrido un error al eliminar este administrador')
      }
    } catch (err) {
      console.error(err)
      notifyError('Error al eliminar el administrador')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      const updatedUserData = { ...userData }
      if (!updatedUserData.password?.trim()) {
        delete updatedUserData.password
      }
      const response = await updateAdminMutation.mutateAsync({ id: userData.id, data: updatedUserData })
      if (response && response.status === 200) {
        notifySuccess('Datos actualizados correctamente')
      } else {
        notifyError('Error al actualizar los datos')
      }
    } catch (error) {
      console.error('Error al actualizar los datos:', error)
      notifyError('Error al actualizar los datos')
    }
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <>
      <div className="main">
        <div className="data">
          <div className="profile">
            <div className='pro'>
              <div className="name">
                <Profile />
                <span className='us-pro'>{userData?.username || 'Usuario no encontrado'}</span>
              </div>
              <button className='del' onClick={eliminarAdmin}>
                <span className='delete'>Eliminar</span>
                <Delete />
              </button>
            </div>

            <div className='us-ad'>
              <form action="" className='form-us2'>
                <div className="forms1">
                  <div className="users1">
                    <span className='use1'>
                      <label className='labels2'>Nombre</label>
                      <input
                        className='us3'
                        type="text"
                        name="username"
                        value={userData?.username || ''}
                        onChange={handleInputChange}
                      />
                    </span>
                    <span className='use1'>
                      <label className='labels2'>Email</label>
                      <input
                        className='us3'
                        type="email"
                        name="email"
                        value={userData?.email || ''}
                        onChange={handleInputChange}
                      />
                    </span>
                    <span className='use1'>
                      <label className='labels2'>Clave</label>
                      <input
                        className='us3'
                        type="text"
                        name="password"
                        placeholder="********"
                        value={userData?.password ?? ''}
                        onChange={handleInputChange}
                      />
                    </span>
                  </div>
                </div>

                <div className="buttons">
                  <div className='buttons1'>
                    <button type="button" className='btns2' onClick={handleSave}>Guardar</button>
                    <button type="button" className='btns3' onClick={() => router.push('/admins')}>Cerrar</button>
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