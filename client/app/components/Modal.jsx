import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"
import { useState } from "react"
import DevicesTable from "./Devices"

export default function ModalDev({ isOpen, onClose}) {
  const [filas, setFilas] = useState([{ telefono: '', mac: '', niv_auth: '', clave: '' }])

  const agregarFila = () => {
    setFilas([...filas, { telefono: '', mac: '', niv_auth: '', clave: '' }])
  }

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="5xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
            <ModalBody>
              <DevicesTable filas={filas} setFilas={setFilas} />
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700" onClick={agregarFila}>
                Añadir un nuevo dispositivo
              </button>
              <button className="text-white bg-cyan-700 hover:bg-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={onClose}>
                Guardar
              </button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}