import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { removeCookie, setCookie } from "@g/cookies"

type SessionContextValue = {
  adminEmail: string | null
  isAuthenticated: boolean
  login: (email: string, token:string) => void
  logout: () => void
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

const ADMIN_EMAIL_STORAGE_KEY = "email"
const ADMIN_COOKIE_KEY = "Admins"
const ADMIN_COOKIE_TOKEN_KEY="Token" 

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedEmail = window.localStorage.getItem(ADMIN_EMAIL_STORAGE_KEY)
    if (storedEmail) setAdminEmail(storedEmail)
  }, [])

  const login = useCallback((email: string, token:string) => {
    setCookie(ADMIN_COOKIE_KEY, email)
    setCookie( ADMIN_COOKIE_TOKEN_KEY,token)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_EMAIL_STORAGE_KEY, email)
    }

    setAdminEmail(email)
  }, [])

  const logout = useCallback(() => {
    removeCookie(ADMIN_COOKIE_KEY)
    removeCookie(ADMIN_COOKIE_TOKEN_KEY)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_EMAIL_STORAGE_KEY)
    }

    setAdminEmail(null)
  }, [])

  const value = useMemo<SessionContextValue>(() => {
    return {
      adminEmail,
      isAuthenticated: Boolean(adminEmail),
      login,
      logout,
    }
  }, [adminEmail, login, logout])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return ctx
}
