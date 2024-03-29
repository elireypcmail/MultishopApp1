import { Customer } from "../Icons"
import Image from "next/image"
import logo from '@p/multi2.jpg'

export default function Login() {
  return(
    <>
      <div className="register">
        <div className="nv">
          <Image className="Logo" src={ logo } alt="Logo de multishop" priority />
        </div>

        <div className="customer">
          <div className="icon">
            <Customer />
          </div>
          <div className="form-cus">
            <form className="form-cus2" action="">
              <input className="cus" type="email" placeholder="Correo" />
              <input className="cus" type="password" placeholder="Contraseña" />
              <button className="btn-cus" type="submit">Registrar</button>
            </form>
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