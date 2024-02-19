import { Router } from 'express'
import controller from '../controllers/user/user.controller.js'
import _var       from '../../global/_var.js'

const userRouter = Router()

userRouter.get(_var.GET_ALL_USER, controller.getUsers)
userRouter.get(_var.GET_ONE_USER, controller.getUser)
userRouter.post(_var.CREATE_USER, controller.postUser)
userRouter.patch(_var.UPDATE_USER, controller.updateUser)
userRouter.delete(_var.DELETE_USER, controller.deleteUser)

export default userRouter