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
  
  if (!isMenuOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMenu}></div>
      <nav className="fixed top-0 left-0 w-2/4 h-full bg-gray-900 z-50">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <button
            type="button"
            onClick={closeMenu}
            className="inline-flex items-center justify-center p-2 text-gray-50 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 absolute top-4 right-4"
          >
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <ul className="flex flex-col font-medium mt-20 space-y-4">
            <li className="lis text-white rounded flex items-center p-2 hover:bg-gray-700 cursor-pointer" id="lis" onClick={() => { router.push('/home'); closeMenu() }}>
              <i className="i mr-2"><Home2 /></i>
              Home
            </li>
            <li className="lis text-white rounded flex items-center p-2 hover:bg-gray-700 cursor-pointer" id="lis" onClick={() => { router.push('/client'); closeMenu(); }}>
              <i className="i mr-2"><Clients2 /></i>
              Clientes
            </li>
            <li className="lis text-white rounded flex items-center p-2 hover:bg-gray-700 cursor-pointer" id="lis" onClick={() => { router.push('/admins'); closeMenu(); }}>
              <i className="i mr-2"><User2 /></i>
              Usuarios
            </li>
            <hr className="border-gray-600" />
            <li className="lis text-white rounded flex items-center p-2 hover:bg-gray-700 cursor-pointer" id="lis" onClick={logoutUser}>
              <i className="i mr-2"><Logout /></i>
              Cerrar Sesión
            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}