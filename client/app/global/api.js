import axios from "axios"

const instance = axios.create({
  baseURL: `https://multishop-app1-production.up.railway.app/`,
  //baseURL: `http://localhost:4000`,
  headers: {
    Accept: "application/json"
  }
})

export default instance