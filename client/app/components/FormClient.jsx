import { useDisclosure } from "@nextui-org/react"
import ModalDev from "./Modal"

export default function FormClient({ }) {
  const {isOpen, onOpen, onClose} = useDisclosure()

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
            <label className="title">Correo Electrónico</label>
            <input type="email" className="input" name="Correo" placeholder="Correo" />
          </span>
        </div>

        <div className="two">
          <span className="span">
            <label className="title">Telefono</label>
            <input type="tel" className="input" name="Telefono" placeholder="Telefono" />
          </span>

          <span className="span">
            <label className="title">Contraseña</label>
            <input type="password" className="input" name="Contraseña" placeholder="Contraseña" />
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
      <button type="button" className="btn">Crear nuevo usuario</button>
    </form>
  )
}