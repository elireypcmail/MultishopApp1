import DataAdmin     from "@c/Admin/DataAdmin"
import { getCookie } from "@g/cookies"
import Navbar        from "@c/Navbar"
import Menu          from "@c/Menu"

export default function RegisterPage({ data }) {
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
            <DataAdmin />
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps = async ({ req }) => {
  const adminCookie = getCookie('Admins', req)
  
  let data = null

  if (adminCookie) {
    try {
      data = adminCookie
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