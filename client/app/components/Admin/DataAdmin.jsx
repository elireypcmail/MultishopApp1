import { useDisclosure } from "@nextui-org/react"
import { useState, useCallback } from 'react'
import MovAdmin from './ModalReg'
import AdminList from './AdminList'
import Image from 'next/image'
import logo from '@p/multi2.png'

export default function DataAdmin() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [admins, setAdmins] = useState([])

  const addAdmin = useCallback((newAdmin) => {
    setAdmins(prevAdmins => [...prevAdmins, newAdmin])
  }, [])

  const updateAdminList = useCallback((newAdminList) => {
    setAdmins(newAdminList)
  }, [])

  return (
    <>
      <div className="main">
        <div className="data">
          <div className="search-head">
            <h1 className="cli">Administradores</h1>
          </div>

          <AdminList admins={admins} updateAdminList={updateAdminList} />

          <button
            type="button"
            className="add"
            onClick={onOpen}
          >
            Añadir Administrador
          </button>
          <MovAdmin isOpen={isOpen} onClose={onClose} addAdmin={addAdmin} />
          
          <div className="multi">
            <span>Powered by</span>
            <Image className="mul" src={logo} alt="Logo de multishop" priority />
          </div>
        </div>
      </div>
    </>
  )
}