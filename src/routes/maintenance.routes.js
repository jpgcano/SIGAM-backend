import express from 'express';
import MaintenanceController from '../controllers/maintenance.controller.js';
import MaintenanceService from '../services/maintenance.service.js';
import MaintenanceModel from '../models/Maintenance.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import permit from '../middlewares/permit.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new MaintenanceController(new MaintenanceService(new MaintenanceModel()));

// GET /mantenimientos
router.get('/', authMiddleware, permit('maintenance', 'list'), ctrl.getAll);

// GET /mantenimientos/:id
router.get('/:id', authMiddleware, permit('maintenance', 'read'), ctrl.getById);

// GET /mantenimientos/tecnico/:id_tecnico — calendario del técnico (HU-07)
router.get('/tecnico/:id_tecnico', authMiddleware, permit('maintenance', 'by_tecnico'), ctrl.getByTecnico);

// GET /mantenimientos/:id/consumos — repuestos usados en una orden
router.get('/:id/consumos', authMiddleware, permit('maintenance', 'consumos'), ctrl.getConsumos);

// POST /mantenimientos
router.post('/', authMiddleware, permit('maintenance', 'create'),
    validateRequired(['id_ticket', 'id_usuario_tecnico']), ctrl.create);

// POST /mantenimientos/:id/consumos — HU-08: registrar repuesto usado
router.post('/:id/consumos', authMiddleware, permit('maintenance', 'add_consumo'),
    validateRequired(['id_repuesto', 'cantidad_usada']), ctrl.registrarConsumo);

// PUT /mantenimientos/:id — actualizar diagnóstico, fechas, checklist
router.put('/:id', authMiddleware, permit('maintenance', 'update'), ctrl.update);

// DELETE /mantenimientos/:id
router.delete('/:id', authMiddleware, permit('maintenance', 'delete'), ctrl.remove);

export default router;
