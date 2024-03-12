import Navbar from './Navbar'
import Menu from './Menu'
import Data from './Data'

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