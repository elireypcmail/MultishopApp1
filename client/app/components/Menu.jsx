import { Clients, Home, User } from "./Icons"
import { useState }            from "react"
import { useRouter }           from 'next/router'
import Image                   from "next/image"
import logo                    from "@p/multi2.jpg"

export default function Menu({ isOpen, toggleMenu }) {
  const router = useRouter()
  const [activeLink, setActiveLink] = useState('/home')

  return(
    <>
      <div className={`menu ${isOpen ? 'open' : ''}`}>
        <div className="men">
          <Image className="logo" src={ logo } alt="Logo de Multishop" priority />
          <ul className="list">
            <li className="li" onClick={() => router.push('/home')}>
              <i><Home /></i>
              Home
            </li>
            <li className="li" onClick={() => router.push('/client')}>
              <i><Clients /></i>
              Clientes
            </li>
            <li className="li" onClick={() => router.push('/user')}>
              <i><User /></i>
              Usuarios
            </li>
          </ul>
          <div className="close-btn" onClick={toggleMenu}>X</div>
        </div>
      </div>
    </>
  )
}