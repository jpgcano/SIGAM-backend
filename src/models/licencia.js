import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class LicenciaModel {
    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('vw_licencias_ocupacion').select('*').order('id_licencia', { ascending: true });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query('SELECT * FROM vw_licencias_ocupacion ORDER BY id_licencia');
        return rows;
    }

    async findById(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('vw_licencias_ocupacion').select('*').eq('id_licencia', id).maybeSingle();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'SELECT * FROM vw_licencias_ocupacion WHERE id_licencia = $1', [id]
        );
        return rows[0] || null;
    }

    async create({ id_software, clave_producto, fecha_expiracion, asientos_totales }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('licencias')
                .insert({ id_software, clave_producto, fecha_expiracion, asientos_totales: asientos_totales ?? 1 })
                .select().single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `INSERT INTO licencias (id_software, clave_producto, fecha_expiracion, asientos_totales)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [id_software, clave_producto, fecha_expiracion, asientos_totales ?? 1]
        );
        return rows[0];
    }

    async update(id, { fecha_expiracion, asientos_totales }) {
        if (useSupabase) {
            const updateData = {};
            if (fecha_expiracion !== undefined) updateData.fecha_expiracion = fecha_expiracion;
            if (asientos_totales !== undefined) updateData.asientos_totales = asientos_totales;
            const { data, error } = await db.supabase
                .from('licencias').update(updateData)
                .eq('id_licencia', id).select().single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            `UPDATE licencias SET
                fecha_expiracion = COALESCE($1, fecha_expiracion),
                asientos_totales = COALESCE($2, asientos_totales)
             WHERE id_licencia = $3 RETURNING *`,
            [fecha_expiracion, asientos_totales, id]
        );
        return rows[0] || null;
    }

    async remove(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('licencias').delete().eq('id_licencia', id).select().single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'DELETE FROM licencias WHERE id_licencia = $1 RETURNING *', [id]
        );
        return rows[0] || null;
    }

    async asignar({ id_licencia, id_usuario, id_activo }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('asignacion_licencias')
                .insert({ id_licencia, id_usuario: id_usuario || null, id_activo: id_activo || null })
                .select().single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `INSERT INTO asignacion_licencias (id_licencia, id_usuario, id_activo)
             VALUES ($1,$2,$3) RETURNING *`,
            [id_licencia, id_usuario || null, id_activo || null]
        );
        return rows[0];
    }

    async getAsignaciones(id_licencia) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('asignacion_licencias')
                .select('*, usuarios(nombre), activos(serial)')
                .eq('id_licencia', id_licencia);
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `SELECT al.*, u.nombre as usuario, a.serial as activo
             FROM asignacion_licencias al
             LEFT JOIN usuarios u ON u.id_usuario = al.id_usuario
             LEFT JOIN activos a ON a.id_activo = al.id_activo
             WHERE al.id_licencia = $1`,
            [id_licencia]
        );
        return rows;
    }

    async revocarAsignacion(id_asignacion) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('asignacion_licencias').delete()
                .eq('id_asignacion', id_asignacion).select().single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'DELETE FROM asignacion_licencias WHERE id_asignacion = $1 RETURNING *', [id_asignacion]
        );
        return rows[0] || null;
    }
}

export default LicenciaModel;