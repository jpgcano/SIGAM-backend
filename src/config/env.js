class EnvConfig {
    static requiredVars() {
        return ['JWT_SECRET', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    }

    static validate() {
        const missing = this.requiredVars().filter((key) => !process.env[key]);
        if (missing.length) {
            throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
        }
    }
}

export default EnvConfig;
