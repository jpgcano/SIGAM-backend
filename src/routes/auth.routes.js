const express = require('express');
const AuthController = require('../controllers/auth.controller');
const AuthService = require('../services/auth.service');
const UserModel = require('../models/User');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateRequired } = require('../middlewares/validate.middleware');

const router = express.Router();

const authController = new AuthController(new AuthService(new UserModel()));

router.post('/login', validateRequired(['email', 'password']), authController.login);

router.get('/admin-panel', authMiddleware, roleMiddleware(['Gerente']), (req, res) => {
    res.json({ msg: 'Bienvenido, Gerente' });
});

router.get('/configuracion', authMiddleware, roleMiddleware(['Técnico', 'Gerente']), (req, res) => {
    res.json({ msg: 'Acceso a configuración técnica' });
});

router.get('/perfil', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente', 'Usuario']), (req, res) => {
    res.json({ msg: 'Tu perfil de usuario' });
});

module.exports = router;
