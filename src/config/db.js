import pkg from 'pg';
const { Pool } = pkg;

class Database {
    constructor() {
        const normalizedHost = (process.env.DB_HOST || '').replace(/^https?:\/\//, '').split('/')[0];
        const dbPassword = process.env.DB_PASSWORD || process.env.DB_KEY;

        this.pool = new Pool({
            host: normalizedHost,
            port: Number(process.env.DB_PORT || 5432),
            user: process.env.DB_USER,
            password: dbPassword,
            database: process.env.DB_NAME,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });
    }

    async query(text, params = []) {
        return this.pool.query(text, params);
    }

    async testConnection() {
        const result = await this.query('SELECT 1 AS ok, NOW() AS now');
        return result.rows[0];
    }
}

export default new Database();
