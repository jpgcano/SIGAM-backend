const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Ruta pública para loguearse
router.post('/login', authController.login);

// --- RUTAS PROTEGIDAS ---

// Solo Gerentes
router.get('/admin-panel', 
    authMiddleware, 
    roleMiddleware(['Gerente']), 
    (req, res) => res.json({ msg: "Bienvenido, Gerente" })
);

// Técnicos y Gerentes
router.get('/configuracion', 
    authMiddleware, 
    roleMiddleware(['Técnico', 'Gerente']), 
    (req, res) => res.json({ msg: "Acceso a configuración técnica" })
);

// Analistas, Técnicos y Gerentes (Cualquier rol válido)
router.get('/perfil', 
    authMiddleware, 
    roleMiddleware(['Analista', 'Técnico', 'Gerente']), 
    (req, res) => res.json({ msg: "Tu perfil de usuario" })
);

module.exports = router;