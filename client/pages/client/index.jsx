import DataClient from "@c/Clientes/DataClient"
import Navbar from "@c/Navbar"
import Menu from "@c/Menu"

export default function Client() {
  return(
    <>
      <div className='body'>
        <div className="container">
          <div className="navbar">
            <Navbar />
          </div>
          <div className="menu">
            <Menu />
          </div>
          <div className='main'>
            <DataClient />
          </div>
        </div>
      </div>
    </>
  )
}