import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import AuthService from '../services/auth.service.js';
import UserModel from '../models/User.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authController = new AuthController(new AuthService(new UserModel()));

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/register', validateRequired(['nombre', 'email', 'password', 'rol']), authController.register);
router.post('/login', loginLimiter, validateRequired(['email', 'password']), authController.login);

router.get('/admin-panel', authMiddleware, roleMiddleware(['Gerente']), (req, res) => {
    res.json({ msg: 'Bienvenido, Gerente' });
});

router.get('/configuracion', authMiddleware, roleMiddleware(['Técnico', 'Gerente']), (req, res) => {
    res.json({ msg: 'Acceso a configuración técnica' });
});

router.get('/perfil', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente', 'Usuario']), (req, res) => {
    res.json({ msg: 'Tu perfil de usuario' });
});

export default router;
