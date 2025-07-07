import {Task} from './TaskRoutes.js'
import {auth} from './authRoutes.js'
import {logs} from './logs.js'

export const Routes= {
    authroutes:auth,
    TaskRoutes:Task,
    logRoutes:logs
}