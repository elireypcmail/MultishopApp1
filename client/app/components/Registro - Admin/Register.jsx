import { registroAdmin }   from "@api/Post"
import { useRouter }       from "next/router"
import toast, {Toaster}    from 'react-hot-toast'
import { Customer, Arrow } from "../Icons"
import { useState }        from "react"
import Loading             from "../Loading"
import Image               from "next/image"
import logo                from '@p/multi2.jpg'

export default function Register() {
  const [names, setNames] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const { push } = useRouter()

  const notifySucces = (msg) => { toast.success(msg) }
  const notifyError  = (msg) => { toast.error(msg) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setNames({ ...names, [name]: value })
    if (name === 'email') {
      validateEmail(value)
    }
  }

  const newUser = async (e) => {
    e.preventDefault()
    setLoading(true)

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
    } catch (err) { 
      console.error(err) 
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 2000)
    }
  }

  const limpiarCampos = () => {
    setNames({
      name: '',
      email: '',
      password: ''
    })
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setEmailError('Ingrese un correo electrónico válido') } 
    else { setEmailError('') }
  }

  return(
    <>
      {loading && <Loading />}
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
                  className="cust" 
                  type="email" 
                  placeholder="Correo" 
                  name="email" 
                  value={names.email} 
                  onChange={handleChange} 
                />
                { emailError && <p className="text-red-500 text-sm">{emailError}</p> }
                <input 
                  className="cus cos" 
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
          <i><Arrow /></i><span className="adminis" onClick={() => push('/admins')}>Ver todos los administradores</span>
        </div>
        <div className="multi">
          <span>Powered by</span>
          <Image className="mul" src={ logo } alt="Logo de multishop" priority />
        </div>
      </div>
    </>
  )
}