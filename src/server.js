import 'dotenv/config';

import app from './app.js';
import EnvConfig from './config/env.js';
import { testSupabaseConnection } from './lib/supabase.js';
import { getErrorCode, getErrorMessage } from './utils/error.util.js';

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        EnvConfig.validate();
        await testSupabaseConnection();
        console.log('Backend conectado a la API de Supabase');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ No fue posible iniciar el servidor:', error);
        process.exit(1);
    }
}

start();
