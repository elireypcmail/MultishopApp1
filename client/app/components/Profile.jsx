import { Profile, Delete } from './Icons'
import Image from 'next/image'
import logo from '@p/multi2.jpg'
import { useDisclosure } from "@nextui-org/react"
import ModalDev from './Modal'

export default function UserProfile() {
  const {isOpen, onOpen, onClose} = useDisclosure()

  return(
    <>
      <div className="main">
        <div className="data">
          <div className="profile">
            <div className='pro'>
              <div className="name">
                <Profile />
                <span className='us-pro'>Panificadora</span>
              </div>
              <button className='del'>
                  <span className='delete'>Eliminar</span>
                  <Delete />
              </button>
            </div>

            <div className='us'>
              <form action="" className='form-us'>
                <div className="forms">
                  <div className="user1">
                    <span className='us1'>
                      <label className='labels'>Identificación</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Nombre</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Telefono #1</label>
                      <input className='us2' type="tel" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Estatus financiero</label>
                      <input className='us2' type="text" />
                    </span>
                  </div>

                  <div className='user2'>
                    <span className='us1'>
                      <label className='labels'>Dirección de instancia</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Estatus de seguridad</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Contraseña</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Dispositivos</label>
                      <button type="button" className="btn4" onClick={onOpen}>
                        Ver dispositivos
                      </button>
                      <ModalDev isOpen={isOpen} onClose={onClose} />
                    </span>
                  </div>
                </div>

                <div className="buttons">
                  <div className='button1'>
                    <button type="button" className='btn2'>Guardar</button>
                    <button type="button" className='btn3'>Cerrar</button>
                  </div>
                  <div className="button2">
                    <button type='button' className='btn5'>Ver movimientos</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="multi">
            <span>Powered by</span>
            <Image className="mul" src={ logo } alt="Logo de multishop" priority />
          </div>
        </div>
      </div>
    </>
  )
}