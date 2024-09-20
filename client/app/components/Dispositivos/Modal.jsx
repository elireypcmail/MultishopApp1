import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter 
} from "@nextui-org/react"
import { useState } from "react"
import DevicesTable from "./Devices"

export default function ModalDev({ isOpen, onClose, dispositivos, onChange }) {
  const [dispositivo, setDispositivo] = useState({ login_user: '', clave: '' })

  const handleChange = (index, e) => {
    if (e && e.target) {
      const { name, value } = e.target
      const nuevosDispositivos = [...dispositivos]
      nuevosDispositivos[index] = { ...nuevosDispositivos[index], [name]: value }
      onChange(nuevosDispositivos)
    } else {
      console.error('Evento no definido correctamente:', e)
    }
  }

  const agregarDispositivo = () => {
    const nuevosDispositivos = [...dispositivos, { login_user: '', clave: '' }]
    onChange(nuevosDispositivos)
  }

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onClose={onClose}
      className="w-full h-full modal"
      size="5xl"
      style={{ maxWidth: '80%', height: '80vh' }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-base ti">Lista de usuarios</ModalHeader>
        <ModalBody>
        <DevicesTable dispositivos={dispositivos} onChange={(newDispositivos) => onChange(newDispositivos)} />
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <button
            className="btn-add-device add text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
            onClick={agregarDispositivo}
          >
            Añadir un nuevo usuario
          </button>
          <button
            className="btn-close-modal close text-white bg-cyan-700 hover:bg-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={onClose}
          >
            Cerrar
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}