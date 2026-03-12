import express from 'express';
import SoftwareController from '../controllers/software.controller.js';
import SoftwareService from '../services/software.service.js';
import SoftwareModel from '../models/software.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import permit from '../middlewares/permit.middleware.js';
import { validateRequired } from '../middlewares/validate.middleware.js';

const router = express.Router();
const ctrl = new SoftwareController(new SoftwareService(new SoftwareModel()));

router.get('/', authMiddleware, permit('software', 'list'), ctrl.getAll);
router.get('/:id', authMiddleware, permit('software', 'read'), ctrl.getById);
router.post('/', authMiddleware, permit('software', 'create'), validateRequired(['nombre']), ctrl.create);
router.put('/:id', authMiddleware, permit('software', 'update'), ctrl.update);
router.delete('/:id', authMiddleware, permit('software', 'delete'), ctrl.remove);

export default router;
