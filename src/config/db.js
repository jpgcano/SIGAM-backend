import pkg from 'pg';
const { Pool } = pkg;

class Database {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 5432),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });
    }

    async query(text, params = []) {
        return this.pool.query(text, params);
    }

    async testConnection() {
        const result = await this.query('SELECT NOW() as now');
        return result.rows[0];
    }
}

export default new Database();
