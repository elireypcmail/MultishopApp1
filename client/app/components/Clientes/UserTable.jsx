import { useEffect, useState } from 'react'
import { useRouter }   from 'next/router'
import { getUsers }    from '@api/Get'
import { updateState } from '@api/Put'
import { getDaysDifference } from '@g/dateComparison'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'

export default function UserTable({ searchResults }) {
  const [users, setUsers] = useState([])
  const [expanded, setExpanded] = useState('panel1')
  const { push } = useRouter()

  let activos = [], inactivos = [], prorrogas = []

  const handleChange = (panel) => (event, isExpanded) =>
    setExpanded(isExpanded ? panel : false)

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setUsers([...searchResults])
    } else {
      loadUsers()
    }
    console.log(users);
    
  }, [searchResults])

  const loadUsers = async () => {
    try {
      const response = await getUsers()
      if (response.status === 200) {
        setUsers([...response.data.data])
      } else {
        console.error('Error al cargar los usuarios:', response.statusText)
      }
    } catch (error) {
      console.error('Error al cargar los usuarios:', error)
    }
  }

  const displayUsers = searchResults.length > 0 ? [...searchResults] : [...users]
  
  let u = [...displayUsers]

  u.map(async (us) => {
    let v = getDaysDifference(us.fecha_corte)

    if (v == true) activos.push(us)
    else if (!v) {
      us['est_financiero'] = 'Inactivo'
      inactivos.push(us)

      const res = await updateState(us['id'])
      console.log(res)
    }
    else if (v > 0 && v <= 5) {
      us['est_financiero'] = 'Prorroga'
      prorrogas.push(us)
    }
    else {
      us['est_financiero'] = 'Inactivo'
      inactivos.push(us)
      const res = await updateState(us['id'])
      console.log(res)
      
    }
  })

  return (
    <div className="lista relative overflow-y-auto shadow-md sm:rounded-lg">
      <div>
        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary
            // expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
            sx={{ bgcolor: '#29BD5A' }}
          >
            <Typography sx={{ flexShrink: 0, color: '#fff' }}>
              Usuarios Activos
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableRenderUsersData
              users={activos}
              push={push}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary
            // expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
            sx={{ bgcolor: '#f97316' }}
          >
            <Typography sx={{ flexShrink: 0, color: '#fff' }}>
              Usuarios en prorroga
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableRenderUsersData
              users={prorrogas}
              push={push}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary
            // expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
            sx={{ bgcolor: '#dc2626' }}
          >
            <Typography sx={{ flexShrink: 0, color: '#fff' }}>
              Usuarios inactivos
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableRenderUsersData
              users={inactivos}
              push={push}
            />
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  )
}

function TableRenderUsersData({ users, push }) {
  return (
    <>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-100 uppercase thead head">
          <tr>
            <th scope="col" className="px-6 py-3">
              ID
            </th>
            <th scope="col" className="px-6 py-3">
              Identificación
            </th>
            <th scope="col" className="px-6 py-3">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3">
              Fecha de corte
            </th>
            <th scope="col" className="px-6 py-3">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {
            users.length > 0
              ?
            users.map((user) => (
              <tr
                key={user.id}
                className="bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => push(`/profile/${user.id}`)}
              >
                <td className="td px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {user.id}
                </td>
                <td className="td-pa px-6 py-4">{user.identificacion}</td>
                <td className="td-pa px-6 py-4">{user.nombre}</td>
                <td className="td-pa px-6 py-4">{(user.fecha_corte).split('T')[0]}</td>
                <td className="td-pa px-6 py-4">{user.est_financiero}</td>
              </tr>
            ))
              :
            <tr>
              <td colSpan={5} className="td-pa px-6 py-4 text-center">Cargando...</td>
            </tr>
          }
        </tbody>
      </table>
    </>
  )
}