const express = require('express');
const UserController = require('../controllers/user.controller');
const UserService = require('../services/user.service');
const UserModel = require('../models/User');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateRequired } = require('../middlewares/validate.middleware');

const router = express.Router();

const userController = new UserController(new UserService(new UserModel()));

router.get('/', authMiddleware, roleMiddleware(['Gerente', 'Analista']), userController.getAll);
router.post('/', authMiddleware, roleMiddleware(['Gerente']), validateRequired(['nombre', 'email', 'password', 'rol']), userController.create);

module.exports = router;
