import express from 'express';
import RepuestoController from '../controllers/repuesto.controller.js';
import RepuestoService from '../services/repuesto.service.js';
import RepuestoModel from '../models/repuesto.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new RepuestoController(new RepuestoService(new RepuestoModel()));

router.get('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getAll);
router.get('/bajo-stock', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.getBajoStock);
router.get('/:id', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getById);
router.post('/', authMiddleware, roleMiddleware(['Analista', 'Gerente']), validateRequired(['nombre']), ctrl.create);
router.put('/:id', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Gerente']), ctrl.remove);

export default router;