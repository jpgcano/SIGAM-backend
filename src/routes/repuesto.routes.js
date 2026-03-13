import express from 'express';
import RepuestoController from '../controllers/repuesto.controller.js';
import RepuestoService from '../services/repuesto.service.js';
import RepuestoModel from '../models/repuesto.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import permit from '../middlewares/permit.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new RepuestoController(new RepuestoService(new RepuestoModel()));

router.get('/', authMiddleware, permit('repuestos', 'list'), ctrl.getAll);
router.get('/bajo-stock', authMiddleware, permit('repuestos', 'bajo_stock'), ctrl.getBajoStock);
router.get('/:id', authMiddleware, permit('repuestos', 'read'), ctrl.getById);
router.post('/', authMiddleware, permit('repuestos', 'create'), validateRequired(['nombre']), ctrl.create);
router.put('/:id', authMiddleware, permit('repuestos', 'update'), ctrl.update);
router.delete('/:id', authMiddleware, permit('repuestos', 'delete'), ctrl.remove);

export default router;
