import { useDisclosure } from "@nextui-org/react"
import { useState } from "react"
import toast, {Toaster} from 'react-hot-toast'
import ModalDev from "../Dispositivos/Modal"
import { registroCliente } from "@api/Post"

export default function FormClient({ }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [cliente, setCliente] = useState({
    identificacion: "",
    nombre: "",
    telefono: "",
    suscripcion: "",
    dispositivos: []
  })

  const notifySucces = (msg) => { toast.success(msg) }
  const notifyError  = (msg) => { toast.error(msg) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setCliente({ ...cliente, [name]: value })
  }

  const handleDispositivosChange = (dispositivos) => {
    setCliente({ ...cliente, dispositivos: dispositivos })
  }

  const newClient = async (e) => {
    e.preventDefault()

    try {
      let res = await registroCliente(cliente)
      if (res.status == '200' || res.data.message == 'Cliente y dispositivos registrados correctamente.') {
        notifySucces('Registrado con éxito!')
      } else {
        notifyError('Error')
      }

      limpiarCampos()
    } catch (err) {
      console.error(err)
    }
  }

  const limpiarCampos = () => {
    setCliente({
      identificacion: "",
      nombre: "",
      telefono: "",
      suscripcion: "",
      dispositivos: []
    })
  }

  return (
    <form onSubmit={newClient} action="" className="form">
      <Toaster position="top-right" reverseOrder={true} duration={5000}/>
      <div className="create">
        <div className="one">
          <span className="span">
            <label className="title">Identificación</label>
            <input type="text" className="input" name="identificacion" value={cliente.identificacion} onChange={handleChange} placeholder="Identificación" />
          </span>

          <span className="span">
            <label className="title">Nombre</label>
            <input type="text" className="input" name="nombre" value={cliente.nombre} onChange={handleChange} placeholder="Nombre" />
          </span>

          <span className="span">
            <label className="title">Telefono</label>
            <input type="tel" className="input" name="telefono" value={cliente.telefono} onChange={handleChange} placeholder="Telefono" />
          </span>

          <span className="span">
            <label className='title'>Tiempo de suscripción</label>
            <input type="number" className="input" name="suscripcion" value={cliente.suscripcion} onChange={handleChange} placeholder="Suscripcion" />
          </span>

          <span className="span">
            <label className="title">Dispositivos</label>
            <button type="button" className="btn1" onClick={onOpen}>
              Añadir dispositivos
            </button>
            <ModalDev isOpen={isOpen} onClose={onClose} dispositivos={cliente.dispositivos} onChange={handleDispositivosChange} />
          </span>
        </div>
      </div>

      <div className="btn">
        <button type="submit" className="btns">Crear nuevo usuario</button>
      </div>
    </form>
  )
}  