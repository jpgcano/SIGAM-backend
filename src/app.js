/*
 * =====================================================
 * DESCRIPTION:
 * Main Express configuration file.
 * Handles middlewares, routes, and API logic.
 * =====================================================
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

/*
 * ===============================
 * GLOBAL MIDDLEWARES
 * ===============================
 */

// Allows server to understand JSON requests
app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
};

app.use(cors(corsOptions));

// HTTP request logger
app.use(morgan('dev'));

/*
 * GET /api/saludo
 * Simple welcome endpoint
 */
app.get('/api/greetting', (req, res) => {
    res.status(200).json({
        message: "Hello! Welcome to your Express API.",
        status: "Success"
    });
});


/*
 * POST /api/usuario
 * Receives user data
 */
app.post('/api/greetting', (req, res) => {
    const { nombre, edad } = req.body;

    // Validation
    if (!nombre) {
        return res.status(400).json({
            error: "User name is required"
        });
    }

    // Response
    res.status(201).json({
        message: `User ${nombre} created successfully`,
        data: { nombre, edad }
    });
});


/*
 * Export app instance
 * Required so server.js can use it
 */
module.exports = app;