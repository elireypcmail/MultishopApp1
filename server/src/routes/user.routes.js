import { Router } from 'express'
import controller from '../controllers/user/user.controller.js'

const userRouter = Router()

userRouter.get('/all/users', controller.getUsers)
userRouter.post('/create/user', controller.postUser)

export default userRouter