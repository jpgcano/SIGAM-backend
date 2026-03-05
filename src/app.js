const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const assetRoutes = require('./routes/asset.routes');
const ticketRoutes = require('./routes/ticket.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'sigam-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/maintenance', maintenanceRoutes);

app.use(errorMiddleware);

module.exports = app;
