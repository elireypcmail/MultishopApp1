import Image from 'next/image'
import admin from '@p/admin-svgrepo-com.png'
import { useEffect }    from 'react'
import { useRouter }    from 'next/router'
import { removeCookie } from '@g/cookies'
 
export default function Navbar({ data, toggleMenu }) {
  const { push } = useRouter()

  function Logout() {
    removeCookie('Admins')
    push('/')
  }

  return(
    <>
      <div className='navbar'>
        <div className="nav">
        <div class="menu-toggle" onClick={toggleMenu}>☰</div>
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