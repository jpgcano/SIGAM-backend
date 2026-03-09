class EnvConfig {
    static mode() {
        return (process.env.DB_MODE || 'postgres').toLowerCase();
    }

    static requiredVars() {
        const base = ['JWT_SECRET'];

        if (this.mode() === 'supabase') {
            return [...base, 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
        }

        return [...base, 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
    }

    static validate() {
        const missing = this.requiredVars().filter((key) => !process.env[key]);
        if (this.mode() === 'postgres' && !process.env.DB_PASSWORD && !process.env.DB_KEY) {
            missing.push('DB_PASSWORD o DB_KEY');
        }
        if (missing.length) {
            throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
        }
    }
}

export default EnvConfig;
