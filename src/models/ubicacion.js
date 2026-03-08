import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class UbicacionModel {
    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ubicaciones').select('*').order('id_ubicacion', { ascending: true });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query('SELECT * FROM ubicaciones ORDER BY id_ubicacion');
        return rows;
    }

    async findById(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ubicaciones').select('*').eq('id_ubicacion', id).maybeSingle();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query('SELECT * FROM ubicaciones WHERE id_ubicacion = $1', [id]);
        return rows[0] || null;
    }

    async create({ sede, piso, sala }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ubicaciones').insert({ sede, piso, sala }).select().single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `INSERT INTO ubicaciones (sede, piso, sala) VALUES ($1,$2,$3) RETURNING *`,
            [sede, piso, sala]
        );
        return rows[0];
    }

    async update(id, { sede, piso, sala }) {
        if (useSupabase) {
            const updateData = {};
            if (sede !== undefined) updateData.sede = sede;
            if (piso !== undefined) updateData.piso = piso;
            if (sala !== undefined) updateData.sala = sala;
            const { data, error } = await db.supabase
                .from('ubicaciones').update(updateData)
                .eq('id_ubicacion', id).select().single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            `UPDATE ubicaciones SET
                sede = COALESCE($1, sede),
                piso = COALESCE($2, piso),
                sala = COALESCE($3, sala)
             WHERE id_ubicacion = $4 RETURNING *`,
            [sede, piso, sala, id]
        );
        return rows[0] || null;
    }

    async remove(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ubicaciones').delete().eq('id_ubicacion', id).select().single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'DELETE FROM ubicaciones WHERE id_ubicacion = $1 RETURNING *', [id]
        );
        return rows[0] || null;
    }
}

export default UbicacionModel;