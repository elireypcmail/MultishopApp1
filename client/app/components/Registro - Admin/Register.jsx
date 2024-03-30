import { Customer } from "../Icons"
import { useState } from "react"
import toast, {Toaster} from 'react-hot-toast'
import { registroAdmin } from "@api/Post"
import Image from "next/image"
import logo from '@p/multi2.jpg'

export default function Register() {
  const [names, setNames] = useState({
    name: '',
    email: '',
    password: ''
  })

  const notifySucces = (msg) => { toast.success(msg) }
  const notifyError  = (msg) => { toast.error(msg) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setNames({ ...names, [name]: value })
  }

  const newUser = async (e) => {
    e.preventDefault()

    try {
      let res = await registroAdmin(names)
      if (res.status == 200) {
        if (res.status == 200 && res.data.message == 'El correo electrónico ya está registrado') {
          notifyError('Este correo ya existe')
        }
        if (res.data.message == 'Usuario creado correctamente') {
          notifySucces('Admin registrado exitosamente')
        } 
      } else { notifyError('Ha ocurrido un error al crear el administrador') }

      limpiarCampos()
    } catch (err) { console.error(err) }
  }

  const limpiarCampos = () => {
    setNames({
      name: '',
      email: '',
      password: ''
    })
  }

  return(
    <>
      <div className="data">
      <Toaster position="top-right" reverseOrder={true} duration={5000}/>
        <div className="reg">
          <div className="customer">
            <i className="icon">
              <Customer />
              <span className="register">Registro de <span className="usuarios">Usuarios</span></span>
            </i>
            <div className="form-cus">
              <form className="form-cus2" action="" onSubmit={newUser}>
                <input 
                  className="cus" 
                  type="text" 
                  placeholder="Nombre" 
                  name="name" 
                  value={names.name} 
                  onChange={handleChange} 
                />
                <input 
                  className="cus" 
                  type="email" 
                  placeholder="Correo" 
                  name="email" 
                  value={names.email} 
                  onChange={handleChange} 
                />
                <input 
                  className="cus" 
                  type="password" 
                  placeholder="Contraseña" 
                  name="password" 
                  value={names.password} 
                  onChange={handleChange} 
                />
                <button className="btn-cus" type="submit">Registrar</button>
              </form>
            </div>
          </div>
        </div>
        <div className="multi">
          <span>Powered by</span>
          <Image className="mul" src={ logo } alt="Logo de multishop" priority />
        </div>
      </div>
    </>
  )
}