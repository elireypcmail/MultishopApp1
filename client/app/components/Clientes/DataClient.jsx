import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Search } from '../Icons'
import UserTable from './UserTable'
import Image from 'next/image'
import logo from '@p/multi2.png'
import { useUsers } from '@g/queries'
import { sileo } from 'sileo'

export default function DataClient() {
  const [filter, setFilter] = useState({
    letra: ''
  })
  const [debouncedFilter, setDebouncedFilter] = useState(filter.letra)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter.letra)
    }, 500)
    return () => clearTimeout(timer)
  }, [filter.letra])
  const router = useRouter()

  const { data, isLoading } = useUsers(debouncedFilter, {
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Error al obtener los clientes"
      sileo.error({ title: errorMessage || "Error al obtener los clientes" })
    }
  })

  const handleInputChange = async (e) => {
    const { value } = e.target
    setFilter({ letra: value })
  }

  return (
    <>
      <div className="main">
        <div className="data">
          <div className="search-head">
            <h1 className="cli">Clientes</h1>
            <form onSubmit={(e) => e.preventDefault()} className="search-bar">
              <input
                className="search-name"
                type="text"
                placeholder="Buscar"
                name="letra"
                value={filter.letra}
                onChange={handleInputChange}
              />
              <button className="search" type="button" >
                <Search />
              </button>
            </form>
          </div>

          <UserTable searchResults={data} isLoading={isLoading} />

          <button
            type="button"
            className="add"
            onClick={() => router.push('/home')}
          >
            Añadir cliente
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