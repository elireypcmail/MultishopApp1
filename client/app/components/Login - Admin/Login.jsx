import { useState, useEffect } from "react"
import toast, {Toaster}        from 'react-hot-toast'
import Loading                 from "../Loading"
import { loginAdmin }          from '@api/Post'
import { setCookie }           from '@g/cookies'
import { Customer }            from "../Icons"
import { useRouter }           from "next/router"
import Image                   from "next/image"
import logo                    from '@p/multi2.png'

export default function Login() {
  const [redirect, setRedirect] = useState(false)
  const [username, setUsername] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const { push } = useRouter()
  useEffect(() => { if (redirect) push('/home') }, [redirect, push])

  const notifySucces = (msg) => { toast.success(msg) }
  const notifyError  = (msg) => { toast.error(msg) }

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
      let res = await loginAdmin(username)
      if (res.status == 200) {
        if (res.data.message == 'Sesión iniciada correctamente') {
          const email = res.data.data.email 
          setCookie('Admins', email)
          localStorage.setItem('email', res.data.data.email)
          notifySucces('Inicio de sección exitoso')
          setRedirect(true)
        } else { notifyError(res.data.message) }
      } else { notifyError('Ha ocurrido un error en el inicio de sesión') }

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

  return(
    <>
      {loading && <Loading />}
      <Toaster position="top-right" reverseOrder={true} duration={5000}/>
      <div className="login">
        <div className="nv">
          <Image className="Logo2" src={ logo } alt="Logo de multishop" priority />
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
                { emailError && <p className="text-red-500 text-sm">{emailError}</p> }
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
          <Image className="mul img" src={ logo } alt="Logo de multishop" priority />
        </div>
      </div>
    </>
  )
}