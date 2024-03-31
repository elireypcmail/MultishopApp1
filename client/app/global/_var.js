const v = {
  // POST
  REGISTRO_C:  process.env.NEXT_PUBLIC_REGISTRO_CLIENTE,
  REGISTRO_A:  process.env.NEXT_PUBLIC_REGISTRO_ADMIN,
  LOGIN_ADMIN: process.env.NEXT_PUBLIC_LOGIN_ADMIN,
  FIND_NOTI_C: process.env.NEXT_PUBLIC_FIND_BY_DATE_CL,

  // GET
  ALL_CLIENTS: process.env.NEXT_PUBLIC_GET_ALL_CLIENTS,
  ONE_CLIENTS: process.env.NEXT_PUBLIC_GET_ONE_CLIENTS,
  GET_NOTIFY:  process.env.NEXT_PUBLIC_GET_NOTIFY_CLI,

  // PUT
  EDIT_CLIENT: process.env.NEXT_PUBLIC_UPDATE_CLIENT,

  // DELETE
  DEL_CLIENT:  process.env.NEXT_PUBLIC_DELETE_CLIENT
}

export default v