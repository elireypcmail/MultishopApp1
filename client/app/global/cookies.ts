import Cookies from "js-cookie"

const setCookie = (key: string, value: any) : void => { Cookies.set(key, value, { expires: 7 }) }

const getCookie = (key: string, req: any) : string | undefined => {
  if (!req.headers.cookie) return undefined

  const cookies = req.headers.cookie.split(';').map((cookie: string) => cookie.trim())
  const cookie = cookies.find((cookie: string) => cookie.startsWith(`${key}=`))

  if (!cookie) return undefined

  return cookie.split('=')[1]
}

const removeCookie = (key: string) : void => { Cookies.remove(key) }

export { setCookie, getCookie, removeCookie }