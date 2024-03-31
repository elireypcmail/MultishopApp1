import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { useState } from "react"
import DevicesTable from "./Devices"

export default function ModalDev({ isOpen, onClose, dispositivos, onChange }) {
  const [dispositivo, setDispositivo] = useState({ telefono: '', mac: '', rol: '', clave: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setDispositivo({ ...dispositivo, [name]: value })
  }

  const agregarDispositivo = () => {
    onChange([...dispositivos, dispositivo]) 
    setDispositivo({ telefono: '', mac: '', rol: '', clave: '' })
  }

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="5xl"
      style={{ maxWidth: '80%', height: '70vh' }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-base">Lista de dispositivos</ModalHeader>
        <ModalBody>
          <DevicesTable dispositivos={dispositivos} onChange={onChange}  />
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <button className="text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700" onClick={agregarDispositivo}>
            Añadir un nuevo dispositivo
          </button>
          <button className="text-white bg-cyan-700 hover:bg-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={onClose}>
            Cerrar
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}