import express from 'express';
import SoftwareController from '../controllers/software.controller.js';
import SoftwareService from '../services/software.service.js';
import SoftwareModel from '../models/software.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new SoftwareController(new SoftwareService(new SoftwareModel()));

router.get('/', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.getAll);
router.get('/:id', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.getById);
router.post('/', authMiddleware, roleMiddleware(['Analista', 'Gerente']), validateRequired(['nombre']), ctrl.create);
router.put('/:id', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Gerente']), ctrl.remove);

export default router;
