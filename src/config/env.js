class EnvConfig {
    static requiredVars() {
        return ['JWT_SECRET', 'SUPABASE_URL'];
    }

    static validate() {
        const missing = this.requiredVars().filter((key) => !process.env[key]);
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY) {
            missing.push('SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY');
        }
        if (missing.length) {
            throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
        }
    }
}

export default EnvConfig;
