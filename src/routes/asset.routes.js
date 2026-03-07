import express from 'express';
import AssetController from '../controllers/asset.controller.js';
import AssetService from '../services/asset.service.js';
import AssetModel from '../models/Asset.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();

const assetController = new AssetController(
    new AssetService(new AssetModel())
);

// Obtener todos los activos
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['Analista', 'Técnico', 'Gerente']),
    assetController.getAll
);

// Crear activo
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['Analista', 'Gerente']),
    validateRequired(['serial', 'fecha_compra', 'vida_util']),
    assetController.create
);

// Rutas adicionales por rol
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
