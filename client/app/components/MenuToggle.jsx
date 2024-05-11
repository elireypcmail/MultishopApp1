'use client'

import { useRouter } from "next/router"
import { removeCookie } from '@g/cookies'
import { Clients2, Home2, User2, Logout } from "./Icons"

export default function MenuToggle({ isMenuOpen, setIsMenuOpen }) {
  const router = useRouter()

  function closeMenu() {
    setIsMenuOpen(false)
  }

  function logoutUser() {
    removeCookie('Admins')
    router.push('/')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-full ">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          
        </div>
      </nav>
      {isMenuOpen && (
        <nav className="fixed top-0 left-0 w-2/4 h-full bg-gray-900 bg-opacity-85 z-50">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <button
              type="button"
              onClick={closeMenu}
              className="inline-flex items-center justify-center p-2 text-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-50 dark:hover:bg-gray-700 dark:focus:ring-gray-600 absolute top-4 left-4"
            >
              <svg
                className="w-14 h-14 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="350"
                height="360"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <ul className="flex flex-col font-medium mt-20">
              <li className="lis text-white rounded flex items-center" onClick={() => router.push('/home')}>
                <i className="i"><Home2 /></i>
                Home
              </li>
              <li className="lis text-white rounded flex items-center" onClick={() => router.push('/client')}>
                <i className="i"><Clients2 /></i>
                Clientes
              </li>
              <li className="lis text-white rounded flex items-center" onClick={() => router.push('/admins')}>
                <i className="i"><User2 /></i>
                Usuarios
              </li>
              <hr />
              <li className="lis text-white rounded flex items-center" onClick={ logoutUser }>
                <i className="i"><Logout /></i>
                Cerrar Sesión
              </li>
            </ul>
          </div>
        </nav>
      )}
    </>
  )
}