import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class ProveedorModel {
    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('proveedores').select('*').order('id_proveedor', { ascending: true });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query('SELECT * FROM proveedores ORDER BY id_proveedor');
        return rows;
    }

    async findById(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('proveedores').select('*').eq('id_proveedor', id).maybeSingle();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query('SELECT * FROM proveedores WHERE id_proveedor = $1', [id]);
        return rows[0] || null;
    }

    async create({ nombre, contacto, identificacion_legal }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('proveedores')
                .insert({ nombre, contacto, identificacion_legal })
                .select().single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `INSERT INTO proveedores (nombre, contacto, identificacion_legal) VALUES ($1,$2,$3) RETURNING *`,
            [nombre, contacto, identificacion_legal]
        );
        return rows[0];
    }

    async update(id, { nombre, contacto }) {
        if (useSupabase) {
            const updateData = {};
            if (nombre !== undefined) updateData.nombre = nombre;
            if (contacto !== undefined) updateData.contacto = contacto;
            const { data, error } = await db.supabase
                .from('proveedores').update(updateData)
                .eq('id_proveedor', id).select().single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            `UPDATE proveedores SET
                nombre = COALESCE($1, nombre),
                contacto = COALESCE($2, contacto)
             WHERE id_proveedor = $3 RETURNING *`,
            [nombre, contacto, id]
        );
        return rows[0] || null;
    }

    async remove(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('proveedores').delete().eq('id_proveedor', id).select().single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'DELETE FROM proveedores WHERE id_proveedor = $1 RETURNING *', [id]
        );
        return rows[0] || null;
    }
}

export default ProveedorModel;