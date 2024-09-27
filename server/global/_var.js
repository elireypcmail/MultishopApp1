import dotentv from "dotenv"
dotentv.config()

const _var = {
  // CORS
  ORIGIN: process.env.FRONT_URL,
  ORIGIN1: process.env.FRONT_2,

  // SERVER
  PORT: process.env.PORT || 5000,

  // TWILIO
  ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  SERVICE_SID: process.env.TWILIO_SERVICE_SID,
  FROM: process.env.TWILIO_FROM_PHONE,

  // DATABASE
  DB_HOST: process.env.HOST,
  DB_USER: process.env.USER,
  DB_PASS: process.env.PASSWORD, 
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.PORT_DB,

  // ROUTES
  // - Clients
  GET_ALL_USER:  process.env.GET_ALL_USER,
  GET_ONE_USER:  process.env.GET_ONE_USER,
  GET_FALSE_US:  process.env.GET_FALSE,
  GET_NOTIFY:    process.env.GET_NOTIFY,
  GET_ALL_MOVE:  process.env.GET_ALL_MOVE,
  MOVES_BY_DATE: process.env.GET_MOVE_DATE,
  FIND_BY_DATE:  process.env.FIND_BY_DATE,
  FILTER_CLIENT: process.env.FILTER_USERS,
  VERIFY_TOKEN:  process.env.VERIFY_TOKEN,
  CODE_CLIENT:   process.env.CODE_USER,
  CREATE_USER:   process.env.CREATE_USER,
  LOGIN_USER:    process.env.LOGIN_USER,
  UPDATE_USER:   process.env.UPDATE_USER,
  DELETE_USER:   process.env.DELETE_USER,
  DELETE_DEVICE: process.env.DELETE_DEVICE,
  PUT_ESTATE:    process.env.CAMBIAR_ESTAD,

  // - Users
  GET_USERS: process.env.GET_ADMINS,
  GET_ADMIN: process.env.GET_ADMIN,
  GET_EMAIL: process.env.GET_AD_EMAIL,
  EDIT_ADM:  process.env.EDIT_ADMIN,
  FILTER_LE: process.env.FILTER_ADM,
  REG_USER:  process.env.REG_USER,
  LOG_USER:  process.env.LOG_USER,
  DELETE_AD: process.env.DELETE_AD,

  // TOKEN KEY
  TOKEN_KEY: process.env.TOKEN
}

export default _var