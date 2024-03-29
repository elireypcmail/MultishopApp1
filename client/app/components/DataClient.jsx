import { Search } from "./Icons"
import logo from '@p/multi2.jpg'
import Image from "next/image"
import { useRouter } from 'next/router'
import UserTable from "./UserTable"

export default function DataClient() {
  const router = useRouter()

  return (
    <>
      <div className="main">
        <div className="data">
          <div className="search-head">
            <h1 className="cli">Lista de Clientes</h1>
            <form action="" className="search-bar">
              <input className="search-name" type="text" placeholder="Buscar" />
              <button className="search" type="button">
                <Search />
              </button>
            </form>
          </div>

          <UserTable />

          <button type="button" className="add" onClick={() => router.push('/home')} >Añadir cliente</button>
          <div className="multi">
            <span>Powered by</span>
            <Image className="mul" src={logo} alt="Logo de multishop" priority />
          </div>
        </div>
      </div>
    </>
  )
}