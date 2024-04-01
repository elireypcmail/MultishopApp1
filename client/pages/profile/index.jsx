import UserProfile from "@c/Perfil - Cliente/Profile"
import Navbar      from "@c/Navbar"
import Menu        from "@c/Menu"

export default function ClientProfile() {
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
            <UserProfile />
          </div>
        </div>
      </div>
    </>
  )
}