import express from 'express';
import UserController from '../controllers/user.controller.js';
import UserService from '../services/user.service.js';
import UserModel from '../models/User.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import permit from '../middlewares/permit.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();

const userController = new UserController(new UserService(new UserModel()));

router.get('/', authMiddleware, permit('users', 'list'), userController.getAll);
router.post('/', authMiddleware, permit('users', 'create'), validateRequired(['nombre', 'email', 'password', 'rol']), userController.create);
router.patch('/:id/rol', authMiddleware, permit('users', 'update_role'), validateRequired(['rol']), userController.updateRole);
router.patch('/:id/password', authMiddleware, permit('users', 'reset_password'), validateRequired(['password']), userController.resetPassword);

export default router;
