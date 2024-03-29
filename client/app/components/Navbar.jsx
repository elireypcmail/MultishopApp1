import Image from 'next/image'
import admin from '@p/admin-svgrepo-com.png'

export default function Navbar() {
  return(
    <>
      <div className='navbar'>
        <div className="nav">
          <div className='adm'>
            <span>Elías Reyes</span>  
            <Image src={ admin } className='admin' alt='Admin' priority />
          </div>
        </div>  
      </div>
    </>
  )
}