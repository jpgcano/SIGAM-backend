import express from 'express';
import TicketController from '../controllers/ticket.controller.js';
import TicketService from '../services/ticket.service.js';
import TicketModel from '../models/Ticket.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import permit from '../middlewares/permit.middleware.js';

const router = express.Router();
const ctrl = new TicketController(new TicketService(new TicketModel()));

// GET /tickets
router.get('/', authMiddleware, permit('tickets', 'list'), ctrl.getAll);

// GET /tickets/activo/:id_activo — tickets de un activo específico
router.get('/activo/:id_activo', authMiddleware, permit('tickets', 'by_activo'), ctrl.getByActivo);

// GET /tickets/asignados/mis — listado de tickets asignados al técnico autenticado
router.get('/asignados/mis', authMiddleware, permit('tickets', 'assigned_mine'), ctrl.getAssigned);

// GET /tickets/metricas — MTTR/MTBF
router.get('/metricas', authMiddleware, permit('tickets', 'metrics'), ctrl.getMetrics);

// GET /tickets/:id
router.get('/:id', authMiddleware, permit('tickets', 'read'), ctrl.getById);

// GET /tickets/:id/suggestions — sugerencias basadas en historial del activo
router.get('/:id/suggestions', authMiddleware, permit('tickets', 'suggestions'), ctrl.getSuggestions);

// POST /tickets â€” crear ticket (HU-05)
router.post('/', authMiddleware, permit('tickets', 'create'), ctrl.create);

// PUT /tickets/:id â€” actualizar estado/prioridad (HU-06)
router.put('/:id', authMiddleware, permit('tickets', 'update'), ctrl.update);

// PATCH /tickets/:id/estado â€” cambio de estado con validaciones de negocio
router.patch('/:id/estado', authMiddleware, permit('tickets', 'change_estado'), ctrl.changeEstado);

// DELETE /tickets/:id
router.delete('/:id', authMiddleware, permit('tickets', 'delete'), ctrl.remove);

export default router;
