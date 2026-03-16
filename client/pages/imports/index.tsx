import Navbar from "@c/Navbar"
import Menu from "@c/Menu"
import JobsManager from "@c/Admin/JobsManager"
import { requireAdminSession } from "@g/ssrGuards"

export default function ImportsPage({ data }: { data: string }) {
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
          <JobsManager />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = async (ctx: any) => {
  return requireAdminSession(ctx)
}

