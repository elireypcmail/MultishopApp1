import axios from "axios"
import Cookies from "js-cookie"
import { removeCookie } from "@g/cookies"

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
  },
})

instance.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") return config

    const token = Cookies.get("Token")
    if (!token) return config

    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`

    return config
  },
  (error) => Promise.reject(error),
)

function clearSessionAndRedirectToLogin() {
  if (typeof window === "undefined" || window.location.pathname === "/") return
  removeCookie("Admins")
  removeCookie("Token")
  window.localStorage.removeItem("email")
  window.location.href = "/"
}

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSessionAndRedirectToLogin()
    }
    return Promise.reject(error)
  },
)

export default instance