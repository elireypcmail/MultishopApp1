import dotentv from "dotenv"
dotentv.config()

const _var = {
  // SERVER
  PORT: process.env.PORT || 5000,

  // DATABASE
  DB_HOST: process.env.HOST,
  DB_USER: process.env.USER,
  DB_PASS: process.env.PASSWORD, 
  DB_NAME: process.env.DB_NAME,
}

export default _var