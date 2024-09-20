'use client'

import { Profile, Delete }          from '../Icons'
import { useState, useEffect }      from 'react'
import { setCookie, removeCookie }  from '@g/cookies'
import toast, { Toaster }           from 'react-hot-toast'
import { useRouter }                from 'next/router'
import { getAdmin, getAdminByEmail } from '@api/Get'
import { deleteAdmin }              from '@api/Delete'
import { updateAdmin }              from '@api/Put'
import Image                        from 'next/image'
import logo                         from '@p/multi2.png'

export default function AdminProfile({ data }) {
  const [userData, setUserData] = useState(data)

  const notifySucces = (msg) => { toast.success(msg) }
  const notifyError = (msg) => { toast.error(msg) }

  const router = useRouter()

  const { id } = router.query

  useEffect(() => {
    setUserData(userData)

    if (id) {
      fetchUserData(id)
    }
  }, [id])

  const fetchUserData = async (id) => {
    try {
      const email = localStorage.getItem('email')
      const response = await getAdmin(id)
      const resEmail = await getAdminByEmail(email)
      
      if (response && resEmail && response.data && resEmail.data && response.status && resEmail.status === 200) {
        const data = response.data.data
        const profileAdmin = {
          id: data?.id,
          username: data?.username,
          email: data?.email,
          password: data?.password
        }

        const Json = JSON.stringify(profileAdmin)
        setCookie('profileAdmin', Json)

        setUserData(response.data.data)
      } else {
        console.error('Error al obtener los datos del administrador:', response)
      }
    } catch (error) {
      console.error('Error al obtener los datos del administrador:', error)
    }
  }

  const eliminarAdmin = async () => {
    try {
      const result = await deleteAdmin(id)
      if (result) {
        removeCookie('Admin')
        notifySucces('Se ha eliminado el administrador correctamente')
        router.push('/admins')
      } else { notifyError('Ha ocurrido un error al eliminar este administrador') }
    } catch (err) { console.error(err) }
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
      const updatedUserData = { ...userData, }
      const response = await updateAdmin(id, updatedUserData)
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
                <span className='us-pro'>{userData ? userData?.username : 'Cargando...'}</span>
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
                        value={userData ? userData?.username : ''}
                        onChange={handleInputChange}
                      />
                    </span>
                    <span className='use1'>
                      <label className='labels2'>Email</label>
                      <input
                        className='us3'
                        type="email"
                        name="email"
                        value={userData ? userData?.email : ''}
                        onChange={handleInputChange}
                      />
                    </span>
                    <span className='use1'>
                      <label className='labels2'>Clave</label>
                      <input
                        className='us3'
                        type="text"
                        name="password"
                        value={userData ? userData?.password : ''}
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