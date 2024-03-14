import { NewUser } from "./Icons"
import Image from "next/image"
import logo from "@p/multi2.jpg"
import FormClient from "./FormClient"

export default function DataHome () {
  return(
    <div className="main">
        <div className="data">
          <i className="user">
            <NewUser />
          </i>
          
          <FormClient />

          <div className="multi">
            <span>Powered by</span>
            <Image className="mul" src={ logo } alt="Logo de multishop" priority />
          </div>
        </div>
      </div>
  )
}