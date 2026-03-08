import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class RepuestoModel {
    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('repuestos').select('*').order('id_repuesto', { ascending: true });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query('SELECT * FROM repuestos ORDER BY id_repuesto');
        return rows;
    }

    async findById(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('repuestos').select('*').eq('id_repuesto', id).maybeSingle();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query('SELECT * FROM repuestos WHERE id_repuesto = $1', [id]);
        return rows[0] || null;
    }

    async findBajoStock() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('vw_repuestos_bajo_stock').select('*');
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query('SELECT * FROM vw_repuestos_bajo_stock');
        return rows;
    }

    async create({ nombre, stock, stock_minimo }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('repuestos')
                .insert({ nombre, stock: stock ?? 0, stock_minimo: stock_minimo ?? 5 })
                .select().single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `INSERT INTO repuestos (nombre, stock, stock_minimo) VALUES ($1,$2,$3) RETURNING *`,
            [nombre, stock ?? 0, stock_minimo ?? 5]
        );
        return rows[0];
    }

    async update(id, { nombre, stock, stock_minimo }) {
        if (useSupabase) {
            const updateData = {};
            if (nombre !== undefined) updateData.nombre = nombre;
            if (stock !== undefined) updateData.stock = stock;
            if (stock_minimo !== undefined) updateData.stock_minimo = stock_minimo;
            const { data, error } = await db.supabase
                .from('repuestos').update(updateData)
                .eq('id_repuesto', id).select().single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            `UPDATE repuestos SET
                nombre = COALESCE($1, nombre),
                stock = COALESCE($2, stock),
                stock_minimo = COALESCE($3, stock_minimo)
             WHERE id_repuesto = $4 RETURNING *`,
            [nombre, stock, stock_minimo, id]
        );
        return rows[0] || null;
    }

    async remove(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('repuestos').delete().eq('id_repuesto', id).select().single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'DELETE FROM repuestos WHERE id_repuesto = $1 RETURNING *', [id]
        );
        return rows[0] || null;
    }
}

export default RepuestoModel;