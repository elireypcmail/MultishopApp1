import { NewUser } from "./Icons"
import Image from "next/image"
import logo from "@p/multi2.jpg"

export default function DataHome () {
  return(
    <div className="main">
        <div className="data">
          <i className="user">
            <NewUser />
          </i>
          <form action="" className="form">
            <div className="create">
              <div className="one">  
                <span className="span">
                  <label className="title">Identificación</label>
                  <input type="text" className="input" name="Identificación" placeholder="Identificacion" />
                </span>

                <span className="span">
                  <label className="title">Nombre</label>
                  <input type="text" className="input" name="Nombre" placeholder="Nombre" />
                </span>

                <span className="span">
                  <label className="title">Correo Electrónico</label>
                  <input type="email" className="input" name="Correo" placeholder="Correo" />
                </span>
              </div>

              <div className="two">
                <span className="span">
                  <label className="title">Telefono</label>
                  <input type="tel" className="input" name="Telefono" placeholder="Telefono" />
                </span>

                <span className="span">
                  <label className="title">Dispositivo</label>
                  <input type="text" className="input" name="Dispositivo" placeholder="Dispositivo" />
                </span>

                <span className="span">
                  <label className="title">Contraseña</label>
                  <input type="password" className="input" name="Contraseña" placeholder="Contraseña" />
                </span>
              </div>
            </div>
            <button type="button" className="btn">Crear nuevo usuario</button>
          </form>

          <div className="multi">
            <span>Powered by</span>
            <Image className="mul" src={ logo } alt="Logo de multishop" priority />
          </div>
        </div>
      </div>
  )
}