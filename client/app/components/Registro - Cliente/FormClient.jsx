import { useState } from 'react'
import { registroCliente } from "@api/Post"
import toast, { Toaster } from 'react-hot-toast'
import { useDisclosure } from "@nextui-org/react"
import Loading from "../Loading"
import ModalDev from "../Dispositivos/Modal"

export default function FormClient({}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [cliente, setCliente] = useState({
    identificacion: "",
    nombre: "",
    telefono: "",
    suscripcion: "",
    type_graph: "Torta",
    dispositivos: []
  })
  const [loading, setLoading] = useState(false)
  const [idtError, setIdtError] = useState('')
  const [telError, setTelError] = useState('')
  const [nombreError, setNombreError] = useState('')

  const notifySuccess = (msg) => { toast.success(msg) }
  const notifyError = (msg) => { toast.error(msg) }

  const validarIdentificacion = (value) => {
    const regex = /^[Vv]\d*$/
    if (!regex.test(value)) {
      setIdtError("El formato de la identificación es incorrecto")
    } else {
      setIdtError('')
    }
  }

  const validarTelefono = (value) => {
    const regex = /^\d{4}\d{7}$/
    if (!regex.test(value)) {
      setTelError("El formato del teléfono es incorrecto")
    } else {
      setTelError('')
    }
  }

  const validarNombre = (value) => {
    setCliente({ ...cliente, nombre: value.toUpperCase() }) 
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let updatedValue = value
  
    if (name === 'identificacion') {
      updatedValue = value.toLowerCase()
      validarIdentificacion(updatedValue)
    }
  
    setCliente({ ...cliente, [name]: updatedValue })
  
    switch (name) {
      case 'telefono':
        validarTelefono(value)
        break
      case 'nombre':
        validarNombre(value)
        break
      default:
        break
    }
  }
  

  const handleDispositivosChange = (dispositivos) => {
    setCliente({ ...cliente, dispositivos: dispositivos })
  }

  const newClient = async (e) => {
    e.preventDefault()

    if (idtError) {
      notifyError('El formato de la identificación es incorrecto')
      return
    } else if (telError) {
      notifyError('El formato del teléfono es incorrecto')
      return
    }

    setLoading(true)

    let res = await registroCliente(cliente)
    console.log(res)
    
    try {
      if (res.success) {
        notifySuccess('Cliente y dispositivos registrados correctamente')
        limpiarCampos()
      } else {
        notifyError(res.error.response.data.message)
      }
    } catch (err) {
      if (res.success === false && err.response && err.response.data && err.response.data.message) {
        notifyError(err.response.data.message)
      } else {
        console.error(err)
        notifyError('Ha ocurrido un error en el servidor')
      }
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 2000)
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
    setIdtError('')
    setTelError('')
    setNombreError('')
  }

  return (
    <>
      {loading && <Loading />}
      <Toaster position="top-right" reverseOrder={true} duration={5000} />
      <form onSubmit={newClient} action="" className="form">
        <div className="create">
          <div className="one">
            <span className="span2">
              <label className="title">Identificación</label>
              <input
                type="text"
                className="input-container"
                name="identificacion"
                value={cliente.identificacion}
                onChange={handleChange}
                placeholder="V00000000"
                required
              />
              {idtError && <p className="text-red-500 text-sm">{idtError}</p>}
            </span>

            <span className="span">
              <label className="title">Nombre</label>
              <input
                type="text"
                className={`input ${nombreError && 'border-red-500'}`}
                name="nombre"
                value={cliente.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                required
              />
              {nombreError && <p className="text-red-500 text-sm">{nombreError}</p>}
            </span>

            <span className="span2">
              <label className="title">Teléfono</label>
              <input
                type="tel"
                className={`input-container ${telError && 'border-red-500'}`}
                name="telefono"
                value={cliente.telefono}
                onChange={handleChange}
                placeholder="Telefono"
                required
              />
              {telError && <p className="text-red-500 text-sm">{telError}</p>}
            </span>
          </div>
        </div>

        <div className="btn">
          <button type="submit" className="btns" disabled={loading}>Crear nuevo usuario</button>
        </div>
      </form>
    </>
  )
}