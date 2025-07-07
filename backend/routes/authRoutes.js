import {Login,Register,getUsers} from '../controllers/authController.js'
import {authenticateToken} from '../middlewares/authenticate.js'
import express from 'express'

const router=express.Router()
router.post('/register',Register );

// User Login
router.post('/login',Login );

// Get all users (for assignment)
router.get('/users', authenticateToken,getUsers);

 export const auth= router