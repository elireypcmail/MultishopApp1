import DataAdmin     from "@c/Admin/DataAdmin"
import Navbar        from "@c/Navbar"
import Menu          from "@c/Menu"
import { requireAdminSession } from "@g/ssrGuards"

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
  return requireAdminSession({ req })
}