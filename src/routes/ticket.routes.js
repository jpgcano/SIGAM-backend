import express from 'express';
import TicketController from '../controllers/ticket.controller.js';
import TicketService from '../services/ticket.service.js';
import TicketModel from '../models/Ticket.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();

const ticketController = new TicketController(new TicketService(new TicketModel()));

router.get('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ticketController.getAll);
router.post('/', authMiddleware, validateRequired(['id_activo', 'id_usuario_reporta', 'descripcion']), ticketController.create);

export default router;
