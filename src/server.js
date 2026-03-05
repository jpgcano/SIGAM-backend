import 'dotenv/config';

import app from './app.js';
import EnvConfig from './config/env.js';
import { testSupabaseConnection } from './lib/supabase.js';

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        EnvConfig.validate();
        await testSupabaseConnection();
        console.log('✅ Backend conectado a la API de Supabase');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ No fue posible iniciar el servidor:', error?.message || error);
        if (Array.isArray(error?.errors) && error.errors.length) {
            error.errors.forEach((inner, index) => {
                console.error(
                    `  ↳ Causa ${index + 1}:`,
                    inner?.code || 'N/A',
                    inner?.address || 'N/A',
                    inner?.port || 'N/A',
                    inner?.message || inner
                );
            });
        } else if (error?.code) {
            console.error('  ↳ Código:', error.code);
        }
        process.exit(1);
    }
}

start();
