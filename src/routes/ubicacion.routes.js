import express from 'express';
import UbicacionController from '../controllers/ubicacion.controller.js';
import UbicacionService from '../services/ubicacion.service.js';
import UbicacionModel from '../models/ubicacion.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new UbicacionController(new UbicacionService(new UbicacionModel()));

router.get('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getAll);
router.get('/:id', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getById);
router.post('/', authMiddleware, roleMiddleware(['Analista', 'Gerente']), validateRequired(['sede']), ctrl.create);
router.put('/:id', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Gerente']), ctrl.remove);

export default router;