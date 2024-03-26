import { Router } from "express" 
import controllerUs from "../controllers/users/user.controller.js"
import _var from "../../global/_var.js"

const userRouter = Router()

userRouter.get(_var.GET_USERS, controllerUs.getadmins)
userRouter.post(_var.REG_USER, controllerUs.register)
userRouter.post(_var.LOG_USER, controllerUs.login)
userRouter.delete(_var.DELETE_AD, controllerUs.deleteAdmin)

export default userRouter