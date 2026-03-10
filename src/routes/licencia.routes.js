import express from 'express';
import LicenciaController from '../controllers/licencia.controller.js';
import LicenciaService from '../services/licencia.service.js';
import LicenciaModel from '../models/licencia.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new LicenciaController(new LicenciaService(new LicenciaModel()));

router.get('/', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.getAll);
router.get('/:id', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.getById);
router.get('/:id/asignaciones', authMiddleware, roleMiddleware(['Analista', 'Gerente', 'Auditor']), ctrl.getAsignaciones);
router.post('/', authMiddleware, roleMiddleware(['Analista', 'Gerente']), validateRequired(['id_software', 'clave_producto']), ctrl.create);
router.post('/asignar', authMiddleware, roleMiddleware(['Analista', 'Gerente']), validateRequired(['id_licencia']), ctrl.asignar);
router.put('/:id', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.update);
router.delete('/:id', authMiddleware, roleMiddleware(['Gerente']), ctrl.remove);
router.delete('/asignacion/:id_asignacion', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.revocarAsignacion);

export default router;