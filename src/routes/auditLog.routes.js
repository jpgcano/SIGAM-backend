import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import permit from '../middlewares/permit.middleware.js';
import AuditLogController from '../controllers/auditLog.controller.js';
import AuditLogService from '../services/auditLog.service.js';

const router = express.Router();
const ctrl = new AuditLogController(new AuditLogService());

router.get('/', authMiddleware, permit('audit', 'list'), ctrl.getAll);
router.get('/:id', authMiddleware, permit('audit', 'read'), ctrl.getById);

export default router;

