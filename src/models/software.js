import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class SoftwareModel {
    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('software')
                .select('*')
                .order('id_software', { ascending: true });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query('SELECT * FROM software ORDER BY id_software');
        return rows;
    }

    async findById(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('software')
                .select('*')
                .eq('id_software', id)
                .maybeSingle();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query('SELECT * FROM software WHERE id_software = $1', [id]);
        return rows[0] || null;
    }

    async create({ nombre, fabricante }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('software')
                .insert({ nombre, fabricante })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            'INSERT INTO software (nombre, fabricante) VALUES ($1,$2) RETURNING *',
            [nombre, fabricante || null]
        );
        return rows[0];
    }

    async update(id, { nombre, fabricante }) {
        if (useSupabase) {
            const updateData = {};
            if (nombre !== undefined) updateData.nombre = nombre;
            if (fabricante !== undefined) updateData.fabricante = fabricante;
            const { data, error } = await db.supabase
                .from('software')
                .update(updateData)
                .eq('id_software', id)
                .select()
                .single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            `UPDATE software SET
                nombre = COALESCE($1, nombre),
                fabricante = COALESCE($2, fabricante)
             WHERE id_software = $3 RETURNING *`,
            [nombre, fabricante, id]
        );
        return rows[0] || null;
    }

    async remove(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('software')
                .delete()
                .eq('id_software', id)
                .select()
                .single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'DELETE FROM software WHERE id_software = $1 RETURNING *',
            [id]
        );
        return rows[0] || null;
    }
}

export default SoftwareModel;
