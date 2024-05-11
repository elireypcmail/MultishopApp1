import { useState }       from "react"
import toast, { Toaster } from 'react-hot-toast'
import Loading            from "../Loading"
import { registroAdmin }  from '@api/Post'

export default function AdminTable() {
  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    password: ""
  })
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const notifySucces = (msg) => { toast.success(msg) }
  const notifyError  = (msg) => { toast.error(msg) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setAdmin({ ...admin, [name]: value })
    if (name === 'email') {
      validateEmail(value)
    }
  }

  const newUser = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let res = await registroAdmin(admin)
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
    setAdmin({
      username: '',
      email: '',
      password: ''
    })
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setEmailError('Ingrese un correo electrónico válido') } 
    else { setEmailError('') }
  }

  return (
    <>
      { loading && <Loading /> }
      <div className="search-head">
        <Toaster position="top-right" reverseOrder={true} duration={5000} />
        <h1 className="cli">Registro de Administradores</h1>
      </div>
        <form onSubmit={newUser} className="form-admin">
          <span className="spans">
            <label className="titles">Nombre</label>
            <input
              type="text"
              className="input2"
              name="username"
              value={admin.username}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
          </span>

          <span className="spans">
            <label className="titles">Email</label>
            <input
              type="text"
              className="input2"
              name="email"
              value={admin.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            { emailError && <p className="text-red-500 text-sm">{emailError}</p> }
          </span>

          <span className="spans">
            <label className="titles">Clave</label>
            <input
              type="text"
              className="input2"
              name="password"
              value={admin.password}
              onChange={handleChange}
              placeholder="Clave"
              required
            />
          </span>

          <div className="btn-ad">
            <button type="submit" className="btns">Crear nuevo usuario</button>
          </div>
        </form>
    </>
  )
}