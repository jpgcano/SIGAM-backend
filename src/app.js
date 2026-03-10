import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import assetRoutes from './routes/asset.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import metricsRoutes from './routes/metrics.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';

// ✅ Nuevas rutas CRUD completos
import repuestoRoutes from './routes/repuesto.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import ubicacionRoutes from './routes/ubicacion.routes.js';
import licenciaRoutes from './routes/licencia.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Auth
app.use('/api/auth', authRoutes);

// Recursos
app.use('/api/usuarios', userRoutes);
app.use('/api/activos', assetRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/mantenimientos', maintenanceRoutes);
app.use('/api/metricas', metricsRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/repuestos', repuestoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);
app.use('/api/licencias', licenciaRoutes);

// Error handler
app.use(errorMiddleware);

export default app;
