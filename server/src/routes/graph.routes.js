import { Router } from "express"
import graphController from "../controllers/graph/graph.controller.js"

const graphRoutes = Router()

graphRoutes.post('/filter-data', graphController.filterData)

export default graphRoutes