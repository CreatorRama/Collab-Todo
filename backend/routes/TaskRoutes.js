import {createTask,deleteTask,smartAssignTask,updateTask,getAllTasks} from '../controllers/Taskcontroller.js'
import express from 'express'
import {authenticateToken} from '../middlewares/authenticate.js'
const router=express.Router()
router.post('/tasks', authenticateToken,createTask);
router.get('/tasks', authenticateToken,getAllTasks);
router.put('/tasks/:id', authenticateToken,updateTask);
router.delete('/tasks/:id', authenticateToken,deleteTask);
router.post('/tasks/:id/smart-assign', authenticateToken,smartAssignTask);
export const Task= router