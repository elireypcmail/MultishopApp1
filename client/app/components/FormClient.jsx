import { useDisclosure } from "@nextui-org/react"
import ModalDev from "./Modal"

export default function FormClient({ }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <form action="" className="form">
      <div className="create">
        <div className="one">
          <span className="span">
            <label className="title">Identificación</label>
            <input type="text" className="input" name="Identificación" placeholder="Identificacion" />
          </span>

          <span className="span">
            <label className="title">Nombre</label>
            <input type="text" className="input" name="Nombre" placeholder="Nombre" />
          </span>

          <span className="span">
            <label className="title">Telefono</label>
            <input type="tel" className="input" name="Telefono" placeholder="Telefono" />
          </span>

          <span className="span">
            <label className='title'>Tiempo de suscripción</label>
            <select
              className="input option text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="nivel1">Seleccione</option>
              <option value="nivel1">30 (días)</option>
              <option value="nivel1">40 (días)</option>
            </select>
          </span>

          <span className="span">
            <label className="title">Dispositivos</label>
            <button type="button" className="btn1" onClick={onOpen}>
              Añadir dispositivos
            </button>

            <ModalDev isOpen={isOpen} onClose={onClose} />
          </span>
        </div>
      </div>
      <div className="btn">
        <button type="button" className="btns">Crear nuevo usuario</button>
      </div>
    </form>
  )
}