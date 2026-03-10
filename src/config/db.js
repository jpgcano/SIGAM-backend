/**
 * db.js — Adaptador universal de base de datos
 *
 * Controla con DB_MODE en tu .env:
 *   DB_MODE=postgres   → PostgreSQL local (default)
 *   DB_MODE=supabase   → Supabase
 */

import pkg from 'pg';
const { Pool } = pkg;
import { createClient } from '@supabase/supabase-js';

const mode = (process.env.DB_MODE || 'postgres').toLowerCase();

// ─── Adaptador PostgreSQL ───────────────────────────────────────────────────
class PostgresAdapter {
    constructor() {
        const normalizedHost = (process.env.DB_HOST || '').replace(/^https?:\/\//, '').split('/')[0];
        this.pool = new Pool({
            host: normalizedHost,
            port: Number(process.env.DB_PORT || 5432),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || process.env.DB_KEY,
            database: process.env.DB_NAME,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });
        console.log('🐘 Base de datos: PostgreSQL local');
    }

    async query(text, params = []) {
        return this.pool.query(text, params);
    }

    async testConnection() {
        const result = await this.query('SELECT 1 AS ok, NOW() AS now');
        return result.rows[0];
    }

    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

// ─── Adaptador Supabase ─────────────────────────────────────────────────────
class SupabaseAdapter {
    constructor() {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY son requeridos en .env para usar Supabase');
        }
        this.client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        console.log('⚡ Base de datos: Supabase');
    }

    async query(text, params = []) {
        let sql = text.trim();
        params.forEach((val, i) => {
            let escaped;
            if (val === null || val === undefined) escaped = 'NULL';
            else if (typeof val === 'string') escaped = `'${val.replace(/'/g, "''")}'`;
            else if (typeof val === 'boolean') escaped = val ? 'TRUE' : 'FALSE';
            else escaped = val;
            sql = sql.replace(new RegExp(`\\$${i + 1}`, 'g'), String(escaped));
        });

        const { data, error } = await this.client.rpc('run_query', { query: sql });
        if (error) throw error;
        return { rows: Array.isArray(data) ? data : [] };
    }

    async testConnection() {
        const { error } = await this.client.from('usuarios').select('id_usuario').limit(1);
        if (error) throw error;
        return { ok: true, mode: 'supabase' };
    }

    get supabase() {
        return this.client;
    }
}

const db = mode === 'supabase' ? new SupabaseAdapter() : new PostgresAdapter();
export default db;
