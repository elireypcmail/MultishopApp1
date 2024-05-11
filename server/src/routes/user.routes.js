import { Router } from "express" 
import controllerUs from "../controllers/users/user.controller.js"
import _var from "../../global/_var.js"

const userRouter = Router()

userRouter.get(_var.GET_USERS, controllerUs.getadmins)
userRouter.get(_var.GET_ADMIN, controllerUs.getAdmin)
userRouter.post(_var.FILTER_LE, controllerUs.filtrarAdminsPorLetra)
userRouter.post(_var.REG_USER, controllerUs.register)
userRouter.post(_var.LOG_USER, controllerUs.login)
userRouter.patch(_var.EDIT_ADM, controllerUs.updateAdmin)
userRouter.delete(_var.DELETE_AD, controllerUs.deleteAdmin)

export default userRouter