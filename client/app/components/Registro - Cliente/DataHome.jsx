import { NewUser } from "../Icons"
import FormClient from "./FormClient"

export default function DataHome() {
  return (
    <div className="data datah da">
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