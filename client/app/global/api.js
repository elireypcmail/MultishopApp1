import axios from "axios"

const instance = axios.create({
  baseURL: `https://multishop-app1.onrender.com/`,
  headers: {
    Accept: "application/json"
  }
})

export default instance