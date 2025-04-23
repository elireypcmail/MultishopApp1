import { Router }     from 'express'
import controller     from '../controllers/clients/client.controller.js'
import controllerNoti from '../controllers/clients/notify.controller.js'
import services       from '../services/user.services.js'
import service        from '../services/twilio.services.js'
import _var           from '../../global/_var.js'

const clientRouter = Router()

clientRouter.get(_var.GET_ALL_USER,     controller.getUsers)
clientRouter.get(_var.GET_ONE_USER,     controller.getUser)
clientRouter.get(_var.GET_FALSE_US,     controller.getClientesInactivos)
clientRouter.get(_var.GET_NOTIFY,       controllerNoti.notifyClient)
clientRouter.get(_var.GET_ALL_MOVE,     services.getAuditoria) // Traer toda la auditoria de un solo usuario
clientRouter.post(_var.MOVES_BY_DATE,   services.getAuditoriaDate) // Traer auditorias por fecha
clientRouter.post(_var.FIND_BY_DATE,    controllerNoti.findByDate)
clientRouter.post(_var.CODE_CLIENT,     controller.code)
clientRouter.post(_var.FILTER_CLIENT,   controller.filtrarClientesPorLetra)
clientRouter.post(_var.VERIFY_TOKEN,    services.verifyToken, controller.checkToken)
clientRouter.post(_var.CREATE_USER,     controller.postUser)
clientRouter.post(_var.LOGIN_USER,      controller.loginUser)
clientRouter.post(_var.RENOVAR_FECHA,   controller.renovarFechaCorte)
clientRouter.patch(_var.UPDATE_USER,    controller.updateUser)
clientRouter.put(_var.PUT_ESTATE,       controller.cambiarEstadoInactivo)
clientRouter.delete(_var.DELETE_USER,   controller.deleteUser)
clientRouter.delete(_var.DELETE_DEVICE, controller.deleteDevice)
clientRouter.post(_var.LAST_SINCRO, controller.getDateSincro)
clientRouter.get(_var.GET_VERSION, controller.getVersion)

clientRouter.post("/api/getMonthlyAverage", services.getAuditoriaPromedio)

export default clientRouter