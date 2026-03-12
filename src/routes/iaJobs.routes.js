import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import permit from '../middlewares/permit.middleware.js';
import IaJobsController from '../controllers/iaJobs.controller.js';
import IaJobsService from '../services/ia/jobs.service.js';

const router = express.Router();
const ctrl = new IaJobsController(new IaJobsService());

router.post(
    '/repuestos/sugerencias',
    authMiddleware,
    permit('ia_jobs', 'purchase_suggestions'),
    ctrl.generatePurchaseSuggestions
);

router.post(
    '/activos/baja-sugerida',
    authMiddleware,
    permit('ia_jobs', 'disposal_suggestions'),
    ctrl.generateDisposalSuggestions
);

router.post(
    '/tickets/reprocess',
    authMiddleware,
    permit('ia_jobs', 'ticket_reprocess'),
    ctrl.reprocessTicketsExternal
);

router.post(
    '/mantenimientos/preventivos',
    authMiddleware,
    permit('ia_jobs', 'preventive_maintenance'),
    ctrl.generatePreventiveMaintenance
);

export default router;
