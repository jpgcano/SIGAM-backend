import express from 'express';
import ProveedorController from '../controllers/proveedor.controller.js';
import ProveedorService from '../services/proveedor.service.js';
import ProveedorModel from '../models/proveedor.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new ProveedorController(new ProveedorService(new ProveedorModel()));

router.get('/', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getAll);
router.get('/:id', authMiddleware, roleMiddleware(['Analista', 'Técnico', 'Gerente']), ctrl.getById);
router.post('/', authMiddleware, roleMiddleware(['Analista', 'Gerente']), validateRequired(['nombre', 'identificacion_legal']), ctrl.create);
router.put('/:id', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Gerente']), ctrl.remove);

export default router;