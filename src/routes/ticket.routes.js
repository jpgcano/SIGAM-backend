import express from 'express';
import TicketController from '../controllers/ticket.controller.js';
import TicketService from '../services/ticket.service.js';
import TicketModel from '../models/Ticket.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();
const ctrl = new TicketController(new TicketService(new TicketModel()));

// GET /tickets
router.get('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getAll);

// GET /tickets/activo/:id_activo — tickets de un activo específico
router.get('/activo/:id_activo', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getByActivo);

// GET /tickets/asignados/mis — listado de tickets asignados al técnico autenticado
router.get('/asignados/mis', authMiddleware, roleMiddleware(['Técnico']), ctrl.getAssigned);

// GET /tickets/:id
router.get('/:id', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getById);

// POST /tickets — crear ticket (HU-05)
router.post('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente', 'Usuario']), ctrl.create);

// PUT /tickets/:id — actualizar estado/prioridad (HU-06)
router.put('/:id', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.update);

// PATCH /tickets/:id/estado — cambio de estado con validaciones de negocio
router.patch('/:id/estado', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.changeEstado);

// DELETE /tickets/:id
router.delete('/:id', authMiddleware, roleMiddleware(['Gerente']), ctrl.remove);

export default router;
