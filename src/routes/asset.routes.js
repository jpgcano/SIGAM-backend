import express from 'express';
import AssetController from '../controllers/asset.controller.js';
import AssetService from '../services/asset.service.js';
import AssetModel from '../models/Asset.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const assetController = new AssetController(new AssetService(new AssetModel()));

// GET /activos — listar todos (con detalle de vista)
router.get('/',
    authMiddleware,
    roleMiddleware(['Analista', 'Técnico', 'Gerente']),
    assetController.getAll
);

// GET /activos/:id — obtener uno
router.get('/:id',
    authMiddleware,
    roleMiddleware(['Analista', 'Técnico', 'Gerente']),
    assetController.getById
);

// GET /activos/:id/historial — hoja de vida del activo
router.get('/:id/historial',
    authMiddleware,
    roleMiddleware(['Analista', 'Técnico', 'Gerente', 'Auditor']),
    assetController.getHistory
);

// POST /activos — crear activo
router.post('/',
    authMiddleware,
    roleMiddleware(['Analista', 'Gerente']),
    validateRequired(['serial', 'fecha_compra', 'vida_util']),
    assetController.create
);

// PUT /activos/:id — actualizar activo
router.put('/:id',
    authMiddleware,
    roleMiddleware(['Analista', 'Gerente']),
    assetController.update
);

// DELETE /activos/:id — baja segura (ISO 27001)
router.delete('/:id',
    authMiddleware,
    roleMiddleware(['Gerente']),
    validateRequired(['motivo_baja', 'certificado_borrado']),
    assetController.remove
);

export default router;