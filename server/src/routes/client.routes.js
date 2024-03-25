import { Router } from 'express'
import controller from '../controllers/clients/client.controller.js'
import services from '../services/user.services.js'
import _var       from '../../global/_var.js'

const clientRouter = Router()

clientRouter.get(_var.GET_ALL_USER, controller.getUsers)
clientRouter.get(_var.GET_ONE_USER, controller.getUser)
clientRouter.get(_var.GET_FALSE_US, controller.getClientesInactivos)
clientRouter.post(_var.VERIFY_TOKEN, services.verifyToken, controller.checkToken)
clientRouter.post(_var.CREATE_USER, controller.postUser)
clientRouter.post(_var.LOGIN_USER, controller.loginUser)
clientRouter.patch(_var.UPDATE_USER, controller.updateUser)
clientRouter.delete(_var.DELETE_USER, controller.deleteUser)

export default clientRouter