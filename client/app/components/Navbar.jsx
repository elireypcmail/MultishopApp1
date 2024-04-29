import Image from 'next/image'
import admin from '@p/admin-svgrepo-com.png'
import { useState }    from 'react'
import { useRouter }    from 'next/router'
import { removeCookie } from '@g/cookies'
import barra from '@p/menu-hamburger-svgrepo-com.png'
import MenuToggle from './MenuToggle'
 
export default function Navbar({ data }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { push } = useRouter()

  function Logout() {
    removeCookie('Admins')
    push('/')
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen)
  }

  return(
    <>
      <div className='navbar'>
        <div className="nav">
        <div className="menu-toggle">
        <button
            className="inline-flex items-center justify-center p-2 w-11 h-11 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            onClick={toggleMenu}
          >
            <Image src={ barra } className='barra' alt='Barra' priority /> 
          </button>
          {isMenuOpen && <MenuToggle isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}
        </div>
          {
            data ? ( 
              <button className='logout' type='button' onClick={ Logout }>Cerrar Sesión</button>
            ) 
            : ( '' )
          }
          <div className='adm'>
            <span className='name'>{ data ? data : '' }</span>  
            <Image src={ admin } className='admin' alt='Admin' priority />
          </div>
        </div>  
      </div>
    </>
  )
}