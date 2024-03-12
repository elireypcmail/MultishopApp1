import Image from "next/image"
import logo from "@p/multi2.jpg"
import { Clients, Home } from "./Icons"

export default function Menu() {
  return(
    <>
      <div className="menu">
        <div className="men">
          <Image className="logo" src={ logo } alt="Logo de Multishop" priority />
          <ul className="list">
            <li className="li">
              <i><Home /></i>
              Home
            </li>
            <li className="li">
              <i><Clients /></i>
              Clientes
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}