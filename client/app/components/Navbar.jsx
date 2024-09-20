import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { removeCookie } from '@g/cookies'
import admin from '@p/admin-svgrepo-com.png'
import { Admin } from './Icons'
import barra from '@p/menu-hamburger-svgrepo-com.png'
import { getCookie } from '@g/cookies'
import MenuToggle from './MenuToggle'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react"

export default function Navbar({ data }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  function Logout() {
    removeCookie('Admins')
    router.push('/')
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen)
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
      const email = localStorage.getItem('email')
      router.push(`/admin/${email}`)
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
          {isMenuOpen && <MenuToggle isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}
        </div>
        {data && (
          <Dropdown>
            <DropdownTrigger>
                <Button 
                  variant="light"
                  className="button p-0 bg-transparent"
                >
                  <div className="ad flex items-center">
                    <div className='adm flex items-center'>
                      <span className='name mr-2'>{data}</span>  
                    </div>
                    <div className="admin">
                      <Image src={admin} className='admin' alt='Admin' priority />
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
    </div>
  )
}