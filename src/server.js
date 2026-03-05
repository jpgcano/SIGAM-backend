require('dotenv').config();

const app = require('./app');
const EnvConfig = require('./config/env');
const db = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        EnvConfig.validate();
        const ping = await db.testConnection();
        console.log(`✅ DB conectada: ${ping.now}`);

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ No fue posible iniciar el servidor:', error.message);
        process.exit(1);
    }
}

start();
