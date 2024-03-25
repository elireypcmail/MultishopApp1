import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"
import MovTable from "./MovTable"

export default function ModalMov({ Open, eClose }) {
  return (
    <>
      <Modal
        backdrop="opaque"
        isOpen={Open}
        onClose={eClose}
        scrollBehavior="inside"
        size="5xl"
      >
        <ModalContent>
          {(eClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
              <ModalBody>
                <MovTable />
              </ModalBody>
              <ModalFooter>
                <button className="text-white bg-gray-600 hover:bg-gray-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700" onClick={eClose}>
                  Cerrar
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}