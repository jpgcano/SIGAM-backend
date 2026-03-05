import express from 'express';
import UserController from '../controllers/user.controller.js';
import UserService from '../services/user.service.js';
import UserModel from '../models/User.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();

const userController = new UserController(new UserService(new UserModel()));

router.get('/', authMiddleware, roleMiddleware(['Gerente', 'Analista']), userController.getAll);
router.post('/', authMiddleware, roleMiddleware(['Gerente']), validateRequired(['nombre', 'email', 'password', 'rol']), userController.create);

export default router;
