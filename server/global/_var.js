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

  // ROUTES
  GET_ALL_USER: process.env.GET_ALL_USER,
  GET_ONE_USER: process.env.GET_ONE_USER,
  CREATE_USER:  process.env.CREATE_USER,
  UPDATE_USER:  process.env.UPDATE_USER,
  DELETE_USER:  process.env.DELETE_USER
}

export default _var