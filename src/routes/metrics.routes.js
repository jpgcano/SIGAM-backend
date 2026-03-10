import express from 'express';
import MetricsController from '../controllers/metrics.controller.js';
import MetricsService from '../services/metrics.service.js';
import MetricsModel from '../models/metrics.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();
const ctrl = new MetricsController(new MetricsService(new MetricsModel()));

// GET /metricas/operacion
router.get('/operacion', authMiddleware, roleMiddleware(['Analista', 'Gerente']), ctrl.getOperational);

export default router;
