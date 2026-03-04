import DataClient from "@c/Clientes/DataClient"
import Navbar     from "@c/Navbar"
import Menu       from "@c/Menu"
import { requireAdminSession } from "@g/ssrGuards"

export default function Client({ data }) {
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
            <DataClient />
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps = async ({ req }) => {
  return requireAdminSession({ req })
}