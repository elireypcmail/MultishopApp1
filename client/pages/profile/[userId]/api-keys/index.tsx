import ApiKeysManager from "@c/Admin/ApiKeysManager"
import Navbar from "@c/Navbar"
import Menu from "@c/Menu"
import { requireAdminSession } from "@g/ssrGuards"

export default function ApiKeysPage({ data }: { data: string }) {
  return (
    <div className="body">
      <div className="container">
        <div className="navbar">
          <Navbar data={data} />
        </div>
        <div className="menu">
          <Menu />
        </div>
        <div className="main main--full">
          <ApiKeysManager />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = async (ctx: any) => {
  return requireAdminSession(ctx)
}
