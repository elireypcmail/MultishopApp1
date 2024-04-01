import Register from "@c/Registro - Admin/Register"
import Navbar   from "@c/Navbar"
import Menu     from "@c/Menu"

export default function RegisterPage() {
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
            <Register />
          </div>
        </div>
      </div>
    </>
  )
}