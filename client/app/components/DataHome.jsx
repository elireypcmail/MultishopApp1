import { NewUser } from "./Icons"
import Image from "next/image"
import logo from "@p/multi2.jpg"
import FormClient from "./FormClient"

export default function DataHome () {
  return(
        <div className="data datah">
          <div className="user">
            <i className="icon-us">
              <NewUser />
              <span className="useri">Registro de <span className="clientes">Clientes</span></span>
            </i>
          </div>
          
          <FormClient />
        </div>
  )
}