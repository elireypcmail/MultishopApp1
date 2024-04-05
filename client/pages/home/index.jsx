import DataHome from "@c/Registro - Cliente/DataHome"
import { getCookie } from "@g/cookies"
import Navbar   from "@c/Navbar"
import Menu     from "@c/Menu"

export default function HomePage({ data }) {
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
            <DataHome />
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