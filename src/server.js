/*
 * =====================================================
 * DESCRIPTION:
 * Entry point of the application.
 * Responsible only for starting the server.
 * =====================================================
 */

require('dotenv').config(); // Loads environment variables from .env file

const app = require('./app'); // Import Express app instance

// Environment port or default
const PORT = process.env.PORT || 3000;

/*
 * Start server
 * This is the only responsibility of this file.
 */
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});