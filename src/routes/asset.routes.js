import express from 'express';
import AssetController from '../controllers/asset.controller.js';
import AssetService from '../services/asset.service.js';
import AssetModel from '../models/Asset.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();

const assetController = new AssetController(new AssetService(new AssetModel()));

router.get('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), assetController.getAll);
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['Analista', 'Gerente']),
    validateRequired(['serial', 'fecha_compra', 'vida_util']),
    assetController.create
);

export default router;
