import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/router'
import admin from '@p/admin-svgrepo-com.png'
import barra from '@p/menu-hamburger-svgrepo-com.png'
import MenuToggle from './MenuToggle'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react"
import { useSession } from '@g/session'

export default function Navbar({ data }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { adminEmail, logout } = useSession()

  function Logout() {
    logout()
    router.push('/')
  }

  function toggleMenu() {
    setIsMenuOpen(prevState => !prevState)
  }

  const dropdownItems = [
    {
      key: "profile",
      label: "Mi perfil",
    },
    {
      key: "logout",
      label: "Cerrar Sesión",
    }
  ]

  const handleAction = (key, req) => {
    if (key === "profile") {
      if (adminEmail) router.push(`/admin/${adminEmail}`)
    } else if (key === "logout") {
      Logout()
    }
  }

  return (
    <div className='navbar'>
      <div className="nav">
        <div className="menu-toggle">
          <button
            className="inline-flex items-center justify-center p-2 w-11 h-11 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            onClick={toggleMenu}
          >
            <Image src={barra} className='barra' alt='Barra' priority /> 
          </button>
        </div>
        {data && (
          <Dropdown>
            <DropdownTrigger>
                <Button 
                  variant="light"
                  className="button p-0 bg-transparent"
                >
                  <div className="ad flex items-center px-[30px]">
                    <div className='adm flex items-center w-full'>
                      <span className='name mr-2'>{data}</span>  
                    </div>
                    <div className='flex items-center justify-center w-[50px]'>
                      <Image src={admin} width='50px' height='50px' className='object-cover' alt='Admin' priority />
                    </div>
                  </div>
                </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="User actions" 
              items={dropdownItems}
              onAction={(key) => handleAction(key)}
            >
              {(item) => (
                <DropdownItem key={item.key}>
                  {item.label}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        )}
      </div>  
      <MenuToggle isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </div>
  )
}