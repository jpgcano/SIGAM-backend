/**
 * db.js — Adaptador único Supabase
 */

import { createClient } from '@supabase/supabase-js';

class SupabaseAdapter {
    constructor() {
        this.client = null;
    }

    ensureClient() {
        if (this.client) return this.client;
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY son requeridos en .env para usar Supabase');
        }
        this.client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        console.log('⚡ Base de datos: Supabase');
        return this.client;
    }

    async query(text, params = []) {
        const client = this.ensureClient();
        let sql = text.trim();
        if (!/^(SELECT|INSERT|UPDATE|DELETE|WITH)\b/i.test(sql)) {
            throw new Error('Solo se permiten consultas SQL DML en modo Supabase');
        }
        if (sql.includes(';')) {
            throw new Error('No se permite SQL multi-sentencia en modo Supabase');
        }
        params.forEach((val, i) => {
            let escaped;
            if (val === null || val === undefined) escaped = 'NULL';
            else if (typeof val === 'string') escaped = `'${val.replace(/'/g, "''")}'`;
            else if (typeof val === 'boolean') escaped = val ? 'TRUE' : 'FALSE';
            else escaped = val;
            sql = sql.replace(new RegExp('\\$' + (i + 1), 'g'), String(escaped));
        });

        const { data, error } = await client.rpc('run_query', { query: sql });
        if (error) throw error;
        return { rows: Array.isArray(data) ? data : [] };
    }

    async testConnection() {
        const client = this.ensureClient();
        const { error } = await client.from('usuarios').select('id_usuario').limit(1);
        if (error) throw error;
        return { ok: true, mode: 'supabase' };
    }

    get supabase() {
        return this.ensureClient();
    }
}

const db = new SupabaseAdapter();
export default db;
