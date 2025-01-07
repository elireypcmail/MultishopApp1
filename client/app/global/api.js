import axios from "axios"

const instance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NODE_ENV === "production"
      ? "https://multishop-app1-production.up.railway.app"
      : "http://localhost:4000",
  headers: {
    Accept: "application/json",
  },
})

export default instance