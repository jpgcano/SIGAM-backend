class EnvConfig {
    static requiredVars() {
        return ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    }

    static validate() {
        const missing = this.requiredVars().filter((key) => !process.env[key]);
        if (missing.length) {
            throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
        }
    }
}

export default EnvConfig;
