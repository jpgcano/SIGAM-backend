import express from 'express';
import MaintenanceController from '../controllers/maintenance.controller.js';
import MaintenanceService from '../services/maintenance.service.js';
import MaintenanceModel from '../models/Maintenance.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();

const maintenanceController = new MaintenanceController(new MaintenanceService(new MaintenanceModel()));

router.get('/', authMiddleware, roleMiddleware(['Técnico', 'Gerente']), maintenanceController.getAll);
router.post('/', authMiddleware, roleMiddleware(['Técnico', 'Gerente']), validateRequired(['id_ticket', 'id_usuario_tecnico']), maintenanceController.create);

export default router;
