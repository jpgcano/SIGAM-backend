const express = require('express');
const AssetController = require('../controllers/asset.controller');
const AssetService = require('../services/asset.service');
const AssetModel = require('../models/Asset');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateRequired } = require('../middlewares/validate.middleware');

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

module.exports = router;
