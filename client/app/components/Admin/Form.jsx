import { useState } from "react"
import { sileo } from "sileo"
import Loading from "../Loading"
import { useRegistrarAdmin } from "@g/queries"

export default function AdminTable({ onClose, addAdmin }) {
  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    password: undefined
  })
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const notifySucces = (msg) => { sileo.success({ title: msg }) }
  const notifyError = (msg) => { sileo.error({ title: msg }) }
  const registrarAdmin = useRegistrarAdmin()

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
      let res = await registrarAdmin.mutateAsync(admin)
      if (res.status == 201) {
        if (res.data.message == 'El correo electrónico ya está registrado') {
          notifyError('Este correo ya existe')
        }
        if (res.data.message == 'Usuario creado correctamente') {
          notifySucces('Admin registrado exitosamente')
          addAdmin({ ...admin, id: res.data.data.id }) // Asumiendo que el backend devuelve el ID del nuevo admin
          onClose()
        }
      } else {
        notifyError('Ha ocurrido un error al crear el administrador')
      }

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
      password: undefined
    })
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setEmailError('Ingrese un correo electrónico válido') }
    else { setEmailError('') }
  }

  return (
    <>
      {loading && <Loading />}
      <div className="search-head">
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
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </span>

        <span className="spans">
          <label className="titles">Clave</label>
          <input
            type="text"
            className="input2"
            name="password"
            placeholder="********"
            value={admin.password}
            onChange={handleChange}
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