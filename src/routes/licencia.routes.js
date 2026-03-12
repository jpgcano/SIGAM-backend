import express from 'express';
import LicenciaController from '../controllers/licencia.controller.js';
import LicenciaService from '../services/licencia.service.js';
import LicenciaModel from '../models/licencia.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import permit from '../middlewares/permit.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new LicenciaController(new LicenciaService(new LicenciaModel()));

router.get('/', authMiddleware, permit('licencias', 'list'), ctrl.getAll);
router.get('/:id', authMiddleware, permit('licencias', 'read'), ctrl.getById);
router.get('/:id/asignaciones', authMiddleware, permit('licencias', 'asignaciones'), ctrl.getAsignaciones);
router.post('/', authMiddleware, permit('licencias', 'create'), validateRequired(['id_software', 'clave_producto']), ctrl.create);
router.post('/asignar', authMiddleware, permit('licencias', 'asignar'), validateRequired(['id_licencia']), ctrl.asignar);
router.put('/:id', authMiddleware, permit('licencias', 'update'), ctrl.update);
router.delete('/:id', authMiddleware, permit('licencias', 'delete'), ctrl.remove);
router.delete('/asignacion/:id_asignacion', authMiddleware, permit('licencias', 'revocar'), ctrl.revocarAsignacion);

export default router;
