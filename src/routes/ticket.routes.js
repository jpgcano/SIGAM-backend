const express = require('express');
const TicketController = require('../controllers/ticket.controller');
const TicketService = require('../services/ticket.service');
const TicketModel = require('../models/Ticket');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validateRequired } = require('../middlewares/validate.middleware');

const router = express.Router();

const ticketController = new TicketController(new TicketService(new TicketModel()));

router.get('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ticketController.getAll);
router.post('/', authMiddleware, validateRequired(['id_activo', 'id_usuario_reporta', 'descripcion']), ticketController.create);

module.exports = router;
