import AdminProfile  from "@c/Admin/ProfileAdmin"
import { getCookie } from "@g/cookies"
import Navbar        from "@c/Navbar"
import Menu          from "@c/Menu"

export default function AdminsProfile({ datapro, data } : any) {
  return(
    <>
      <div className='body'>
        <div className="container">
          <div className="navbar">
            <Navbar data={data} />
          </div>
          <div className="menu">
            <Menu />
          </div>
          <div className='main'>
            <AdminProfile data={datapro} />
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps = async ({ req }: any) => {
  const profileCookie = getCookie('profileAdmin', req)
  const adminCookie = getCookie('Admins', req)

  if (!adminCookie) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  
  let data = null
  let datapro = null

  if (profileCookie && adminCookie) {
    try {
      const decodedCookie = decodeURIComponent(profileCookie)
      datapro = JSON.parse(decodedCookie)
      data = adminCookie
    } catch (error) {
      console.error('Error al analizar la cookie como JSON:', error)
    }
  }

  return {
    props: {
      datapro: datapro,
      data: data
    }
  }
}