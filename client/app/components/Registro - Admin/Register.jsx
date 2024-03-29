import { Customer } from "../Icons"
import Image from "next/image"
import logo from '@p/multi2.jpg'

export default function Register() {
  return(
    <>
      <div className="data">
        <div className="reg">
          <div className="customer">
            <i className="icon">
              <Customer />
              <span className="register">Registro de <span className="usuarios">Usuarios</span></span>
            </i>
            <div className="form-cus">
              <form className="form-cus2" action="">
                <input className="cus" type="text" placeholder="Nombre" />
                <input className="cus" type="email" placeholder="Correo" />
                <input className="cus" type="password" placeholder="Contraseña" />
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