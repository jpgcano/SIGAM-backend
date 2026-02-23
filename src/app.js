const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(cors());

// Registro de rutas
app.use('/api/auth', authRoutes);

module.exports = app;