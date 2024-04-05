import Image from 'next/image'
import admin from '@p/admin-svgrepo-com.png'
import { useEffect }    from 'react'
import { useRouter }    from 'next/router'
import { removeCookie } from '@g/cookies'
 
export default function Navbar({ data }) {
  const { push } = useRouter()

  function Logout() {
    removeCookie('Admins')
    push('/')
  }

  useEffect(() => {
    const isLoggedIn = !!document.cookie.replace(
      /(?:(?:^|.*;\s*)loggedIn\s*\=\s*([^;]*).*$)|^.*$/,
      '$1'
    )

    if (!isLoggedIn) {
      push('/')
    }
  }, [])

  return(
    <>
      <div className='navbar'>
        <div className="nav">
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