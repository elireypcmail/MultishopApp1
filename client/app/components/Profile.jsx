import { Profile, Delete } from './Icons'
import Image from 'next/image'
import logo from '@p/multi2.jpg'

export default function UserProfile() {
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
                      <label className='labels'>Telefono #2</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Dispositivo #1</label>
                      <input className='us2' type="text" />
                    </span>
                  </div>

                  <div className='user2'>
                    <span className='us1'>
                      <label className='labels'>Dispositivo #2</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Estatus financiero</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Dirección de instancia</label>
                      <input className='us2' type="text" />
                    </span>
                    <span className='us1'>
                      <label className='labels'>Estatus de seguridad</label>
                      <input className='us2' type="text" />
                    </span>
                  </div>
                  
                  
                </div>
                <div className="buttons">
                    <button type="button" className='btn1'>Cerrar</button>
                    <button type="button" className='btn2'>Guardar</button>
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