import express from 'express';
import MaintenanceController from '../controllers/maintenance.controller.js';
import MaintenanceService from '../services/maintenance.service.js';
import MaintenanceModel from '../models/Maintenance.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new MaintenanceController(new MaintenanceService(new MaintenanceModel()));

// GET /mantenimientos
router.get('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getAll);

// GET /mantenimientos/:id
router.get('/:id', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getById);

// GET /mantenimientos/tecnico/:id_tecnico — calendario del técnico (HU-07)
router.get('/tecnico/:id_tecnico', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getByTecnico);

// GET /mantenimientos/:id/consumos — repuestos usados en una orden
router.get('/:id/consumos', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getConsumos);

// POST /mantenimientos
router.post('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']),
    validateRequired(['id_ticket', 'id_usuario_tecnico']), ctrl.create);

// POST /mantenimientos/:id/consumos — HU-08: registrar repuesto usado
router.post('/:id/consumos', authMiddleware, roleMiddleware(['Técnico']),
    validateRequired(['id_repuesto', 'cantidad_usada']), ctrl.registrarConsumo);

// PUT /mantenimientos/:id — actualizar diagnóstico, fechas, checklist
router.put('/:id', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.update);

// DELETE /mantenimientos/:id
router.delete('/:id', authMiddleware, roleMiddleware(['Gerente']), ctrl.remove);

export default router;
