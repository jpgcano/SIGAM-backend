/*
 * =====================================================
 * DESCRIPTION:
 * Entry point of the application.
 * Responsible only for starting the server.
 * =====================================================
 */

require('dotenv').config(); // Carga el archivo .env
const app = require('./app'); // Trae la configuración de arriba

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
});