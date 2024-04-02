import UserProfile from "@c/Perfil - Cliente/Profile"
import { getCookie } from "@g/cookies"
import Navbar        from "@c/Navbar"
import Menu          from "@c/Menu"

export default function ClientProfile({ data } : any) {
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
            <UserProfile data={data} />
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps = async ({ req }: any) => {
  const profileCookie = getCookie('profile', req)
  
  let data = null

  if (profileCookie) {
    try {
      const decodedCookie = decodeURIComponent(profileCookie)
      data = JSON.parse(decodedCookie)
    } catch (error) {
      console.error('Error al analizar la cookie como JSON:', error)
    }
  }

  return {
    props: {
      data: data
    }
  }
}
