import Navbar from "@c/Navbar"
import Menu from "@c/Menu"
import Data from "@c/Data"

export default function HomePage() {
  return (
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
            <Data />
          </div>
        </div>
      </div>
    </>
  )
}