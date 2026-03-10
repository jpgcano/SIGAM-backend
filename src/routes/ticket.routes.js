import express from 'express';
import TicketController from '../controllers/ticket.controller.js';
import TicketService from '../services/ticket.service.js';
import TicketModel from '../models/Ticket.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();
const ctrl = new TicketController(new TicketService(new TicketModel()));

// GET /tickets
router.get('/', authMiddleware, roleMiddleware(['Analista', 'TÃ©cnico', 'Gerente']), ctrl.getAll);

// GET /tickets/activo/:id_activo â€” tickets de un activo especÃ­fico
router.get('/activo/:id_activo', authMiddleware, roleMiddleware(['Analista', 'TÃ©cnico', 'Gerente']), ctrl.getByActivo);

// GET /tickets/asignados/mis â€” listado de tickets asignados al tÃ©cnico autenticado
router.get('/asignados/mis', authMiddleware, roleMiddleware(['TÃ©cnico']), ctrl.getAssigned);

// GET /tickets/metricas â€” MTTR/MTBF
router.get('/metricas', authMiddleware, roleMiddleware(['Analista', 'TÃ©cnico', 'Gerente']), ctrl.getMetrics);

// GET /tickets/:id
router.get('/:id', authMiddleware, roleMiddleware(['Analista', 'TÃ©cnico', 'Gerente']), ctrl.getById);

// POST /tickets â€” crear ticket (HU-05)
router.post('/', authMiddleware, roleMiddleware(['Analista', 'TÃ©cnico', 'Gerente', 'Usuario']), ctrl.create);

// PUT /tickets/:id â€” actualizar estado/prioridad (HU-06)
router.put('/:id', authMiddleware, roleMiddleware(['Analista', 'TÃ©cnico', 'Gerente']), ctrl.update);

// PATCH /tickets/:id/estado â€” cambio de estado con validaciones de negocio
router.patch('/:id/estado', authMiddleware, roleMiddleware(['Analista', 'TÃ©cnico', 'Gerente']), ctrl.changeEstado);

// DELETE /tickets/:id
router.delete('/:id', authMiddleware, roleMiddleware(['Gerente']), ctrl.remove);

export default router;