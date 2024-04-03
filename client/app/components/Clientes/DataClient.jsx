import { useState }  from 'react'
import { useRouter } from 'next/router'
import { Search }    from '../Icons'
import UserTable     from './UserTable'
import Image         from 'next/image'
import logo          from '@p/multi2.jpg'
import { filtrarClientesPorLetra } from '@api/Post'

export default function DataClient() {
  const [filter, setFilter] = useState({
    letra: ''
  })
  const [searchResults, setSearchResults] = useState([])
  const router = useRouter()

  const handleInputChange = async (e) => {
    const { value } = e.target
    setFilter({ letra: value })

    try {
      const results = await filtrarClientesPorLetra(value)
      setSearchResults(results.data.data)
    } catch (error) {
      console.error('Error al realizar la búsqueda:', error)
    }
  }

  return (
    <>
      <div className="main">
        <div className="data">
          <div className="search-head">
            <h1 className="cli">Lista de Clientes</h1>
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

          <UserTable searchResults={searchResults} />

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