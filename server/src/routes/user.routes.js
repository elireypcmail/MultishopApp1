import { Router } from "express" 
import controllerUs from "../controllers/users/user.controller.js"
import _var from "../../global/_var.js"

const userRouter = Router()

userRouter.post(_var.REG_USER, controllerUs.register)
userRouter.post(_var.LOG_USER, controllerUs.login)

export default userRouter