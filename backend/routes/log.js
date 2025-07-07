import { actionLogs } from "../controllers/logController.js";
import express from 'express'
import {authenticateToken} from '../middlewares/authenticate.js'
const router=express.Router()
router.get('/actions', authenticateToken,actionLogs);

export const logs= router