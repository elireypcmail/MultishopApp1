import { Router } from 'express'
import controller from '../controllers/clients/client.controller.js'
import _var       from '../../global/_var.js'

const clientRouter = Router()

clientRouter.get(_var.GET_ALL_USER, controller.getUsers)
clientRouter.get(_var.GET_ONE_USER, controller.verifyToken, controller.getUser)
//userRouter.post(_var.VERIFY_TOKEN, controller.verifyToken)
clientRouter.post(_var.CREATE_USER, controller.postUser)
clientRouter.patch(_var.UPDATE_USER, controller.updateUser)
clientRouter.delete(_var.DELETE_USER, controller.deleteUser)

export default clientRouter