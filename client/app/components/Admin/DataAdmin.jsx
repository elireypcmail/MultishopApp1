import { useRouter } from 'next/router'
import AdminList     from './AdminList'
import Image         from 'next/image'
import logo          from '@p/multi2.jpg'

export default function DataAdmin() {
  const router = useRouter()

  return (
    <>
      <div className="main">
        <div className="data">
          <div className="search-head">
            <h1 className="cli">Administradores</h1>
          </div>

          <AdminList  />

          <button
            type="button"
            className="add"
            onClick={() => router.push('/user')}
          >
            Añadir Administrador
          </button>
          <div className="multi">
            <span>Powered by</span>
            <Image className="mul" src={logo} alt="Logo de multishop" priority />
          </div>
        </div>
      </div>
    </>
  )
}