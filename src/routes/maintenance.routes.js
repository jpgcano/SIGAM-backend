const express = require('express');
const MaintenanceController = require('../controllers/maintenance.controller');
const MaintenanceService = require('../services/maintenance.service');
const MaintenanceModel = require('../models/Maintenance');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateRequired } = require('../middlewares/validate.middleware');

const router = express.Router();

const maintenanceController = new MaintenanceController(new MaintenanceService(new MaintenanceModel()));

router.get('/', authMiddleware, roleMiddleware(['Técnico', 'Gerente']), maintenanceController.getAll);
router.post('/', authMiddleware, roleMiddleware(['Técnico', 'Gerente']), validateRequired(['id_ticket', 'id_usuario_tecnico']), maintenanceController.create);

module.exports = router;
