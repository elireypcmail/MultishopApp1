import AdminProfile from "@c/Admin/ProfileAdmin"
import { getCookie } from "@g/cookies"
import Navbar from "@c/Navbar"
import Menu from "@c/Menu"
import { requireAdminSession } from "@g/ssrGuards"

export default function AdminsProfile({ datapro, data }: any) {
  return (
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
  return requireAdminSession({ req }, async (adminEmail) => {
    const profileCookie = getCookie('profileAdmin', req)


    if (profileCookie) {
      try {
        const decodedCookie = decodeURIComponent(profileCookie)
        const datapro = decodedCookie ? JSON.parse(decodedCookie) : null
        return {
          datapro: datapro,
        }
      } catch (error) {
        console.error('Error al analizar la cookie como JSON:', error)
        return {
          datapro: null,
        }
      }
    }
  })
}