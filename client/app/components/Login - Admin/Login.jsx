import { useState } from "react"
import { sileo } from "sileo"
import Loading from "../Loading"
import { useLoginAdmin } from '@g/queries'
import { Customer } from "../Icons"
import { useRouter } from "next/router"
import Image from "next/image"
import logo from '@p/multi2.png'
import { useSession } from "@g/session"

export default function Login() {
  const [username, setUsername] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const { push } = useRouter()
  const { login } = useSession()
  const loginMutation = useLoginAdmin()

  const notifySucces = (msg) => { sileo.success({ title: msg }) }
  const notifyError = (msg) => { sileo.error({ title: msg }) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUsername({ ...username, [name]: value })
    if (name === 'email') {
      validateEmail(value)
    }
  }

  const loginUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { status, data } = await loginMutation.mutateAsync(username)
      if (status == 200) {
        if (data.message == 'Sesión iniciada correctamente') {
          const email = data.data.email
          const token = data.tokenCode
          login(email, token)
          notifySucces('Inicio de sesión exitoso')
          push('/home')
        } else { notifyError(data.message) }
      } else {
        notifyError(data.message)
      }
      limpiarCampos()
    } finally {
      setLoading(false)
    }
  }

  const limpiarCampos = () => {
    setUsername({
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
      {loading && <Loading />}
      <div className="login">
        <div className="nv">
          <Image className="Logo2" src={logo} alt="Logo de multishop" priority />
        </div>

        <div className="customer2">
          <div className="form-login">
            <div className="iconL">
              <Customer />
            </div>
            <div className="form-cusL">
              <form className="form-cusL2" action="" onSubmit={loginUser}>
                <input
                  className="input-container"
                  type="email"
                  placeholder="Correo"
                  name="email"
                  value={username.email}
                  onChange={handleChange}
                />
                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                <input
                  className="cusL"
                  type="password"
                  placeholder="Contraseña"
                  name="password"
                  value={username.password}
                  onChange={handleChange}
                />
                <button className="btn-cusL" type="submit">Iniciar Sesión</button>
              </form>
            </div>
          </div>
        </div>

        <div className="multi footer">
          <span>Powered by</span>
          <Image className="mul img" src={logo} alt="Logo de multishop" priority />
        </div>
      </div>
    </>
  )
}