import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class TicketModel {
    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('vw_tickets_operacion')
                .select('*')
                .order('id_ticket', { ascending: false });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            'SELECT * FROM vw_tickets_operacion ORDER BY id_ticket DESC'
        );
        return rows;
    }

    async findById(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('vw_tickets_operacion')
                .select('*')
                .eq('id_ticket', id)
                .maybeSingle();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'SELECT * FROM vw_tickets_operacion WHERE id_ticket = $1', [id]
        );
        return rows[0] || null;
    }

    async findByActivo(id_activo) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('vw_tickets_operacion')
                .select('*')
                .eq('id_activo', id_activo)
                .order('id_ticket', { ascending: false });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            'SELECT * FROM vw_tickets_operacion WHERE id_activo = $1 ORDER BY id_ticket DESC',
            [id_activo]
        );
        return rows;
    }

    async findAssignedByTecnico(id_tecnico) {
        const { rows } = await db.query(
            `SELECT vto.*
             FROM vw_tickets_operacion vto
             LEFT JOIN ordenes_mantenimiento om ON om.id_ticket = vto.id_ticket
             WHERE om.id_usuario_tecnico = $1
             ORDER BY vto.id_ticket DESC`,
            [id_tecnico]
        );
        return rows;
    }

    async create({ id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('tickets')
                .insert({ id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp })
                .select('*')
                .single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `INSERT INTO tickets (id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp]
        );
        return rows[0];
    }

    async update(id, { prioridad_ia, clasificacion_nlp, estado }) {
        if (useSupabase) {
            const updateData = {};
            if (prioridad_ia !== undefined) updateData.prioridad_ia = prioridad_ia;
            if (clasificacion_nlp !== undefined) updateData.clasificacion_nlp = clasificacion_nlp;
            if (estado !== undefined) updateData.estado = estado;
            const { data, error } = await db.supabase
                .from('tickets')
                .update(updateData)
                .eq('id_ticket', id)
                .select('*')
                .single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            `UPDATE tickets SET
                prioridad_ia = COALESCE($1, prioridad_ia),
                clasificacion_nlp = COALESCE($2, clasificacion_nlp),
                estado = COALESCE($3, estado)
             WHERE id_ticket = $4 RETURNING *`,
            [prioridad_ia, clasificacion_nlp, estado, id]
        );
        return rows[0] || null;
    }

    async updateEstado(id, estado) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('tickets')
                .update({ estado })
                .eq('id_ticket', id)
                .select('*')
                .single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            `UPDATE tickets
             SET estado = $1
             WHERE id_ticket = $2
             RETURNING *`,
            [estado, id]
        );
        return rows[0] || null;
    }

    async isAssignedToTecnico(id_ticket, id_tecnico) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ordenes_mantenimiento')
                .select('id_orden')
                .eq('id_ticket', id_ticket)
                .eq('id_usuario_tecnico', id_tecnico)
                .limit(1);
            if (error) throw error;
            return Array.isArray(data) && data.length > 0;
        }
        const { rows } = await db.query(
            `SELECT 1
             FROM ordenes_mantenimiento
             WHERE id_ticket = $1
               AND id_usuario_tecnico = $2
             LIMIT 1`,
            [id_ticket, id_tecnico]
        );
        return rows.length > 0;
    }

    async remove(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('tickets').delete().eq('id_ticket', id).select('*').single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'DELETE FROM tickets WHERE id_ticket = $1 RETURNING *', [id]
        );
        return rows[0] || null;
    }
}

export default TicketModel;
