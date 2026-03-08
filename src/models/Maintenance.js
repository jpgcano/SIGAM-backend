import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class MaintenanceModel {
    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ordenes_mantenimiento')
                .select(`
                    *,
                    tickets(id_ticket, descripcion, estado),
                    usuarios(nombre)
                `)
                .order('id_orden', { ascending: false });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `SELECT om.*, t.descripcion AS ticket_descripcion, t.estado AS ticket_estado,
                    u.nombre AS tecnico_nombre
             FROM ordenes_mantenimiento om
             LEFT JOIN tickets t ON t.id_ticket = om.id_ticket
             LEFT JOIN usuarios u ON u.id_usuario = om.id_usuario_tecnico
             ORDER BY om.id_orden DESC`
        );
        return rows;
    }

    async findById(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ordenes_mantenimiento')
                .select(`
                    *,
                    tickets(id_ticket, descripcion, estado, prioridad_ia),
                    usuarios(nombre)
                `)
                .eq('id_orden', id)
                .maybeSingle();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            `SELECT om.*, t.descripcion AS ticket_descripcion, t.estado AS ticket_estado,
                    t.prioridad_ia, u.nombre AS tecnico_nombre
             FROM ordenes_mantenimiento om
             LEFT JOIN tickets t ON t.id_ticket = om.id_ticket
             LEFT JOIN usuarios u ON u.id_usuario = om.id_usuario_tecnico
             WHERE om.id_orden = $1`,
            [id]
        );
        return rows[0] || null;
    }

    async findByTecnico(id_tecnico) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ordenes_mantenimiento')
                .select('*, tickets(descripcion, estado, prioridad_ia)')
                .eq('id_usuario_tecnico', id_tecnico)
                .order('id_orden', { ascending: false });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `SELECT om.*, t.descripcion AS ticket_descripcion,
                    t.estado AS ticket_estado, t.prioridad_ia
             FROM ordenes_mantenimiento om
             LEFT JOIN tickets t ON t.id_ticket = om.id_ticket
             WHERE om.id_usuario_tecnico = $1
             ORDER BY om.id_orden DESC`,
            [id_tecnico]
        );
        return rows;
    }

    async create({ id_ticket, id_usuario_tecnico, diagnostico, fecha_inicio, fecha_fin, checklist_seguridad }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ordenes_mantenimiento')
                .insert({
                    id_ticket, id_usuario_tecnico, diagnostico,
                    fecha_inicio: fecha_inicio || null,
                    fecha_fin: fecha_fin || null,
                    checklist_seguridad: checklist_seguridad ?? false
                })
                .select('*')
                .single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `INSERT INTO ordenes_mantenimiento
                (id_ticket, id_usuario_tecnico, diagnostico, fecha_inicio, fecha_fin, checklist_seguridad)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [id_ticket, id_usuario_tecnico, diagnostico,
            fecha_inicio || null, fecha_fin || null, checklist_seguridad ?? false]
        );
        return rows[0];
    }

    async update(id, { diagnostico, fecha_inicio, fecha_fin, checklist_seguridad, id_usuario_tecnico }) {
        if (useSupabase) {
            const updateData = {};
            if (diagnostico !== undefined) updateData.diagnostico = diagnostico;
            if (fecha_inicio !== undefined) updateData.fecha_inicio = fecha_inicio;
            if (fecha_fin !== undefined) updateData.fecha_fin = fecha_fin;
            if (checklist_seguridad !== undefined) updateData.checklist_seguridad = checklist_seguridad;
            if (id_usuario_tecnico !== undefined) updateData.id_usuario_tecnico = id_usuario_tecnico;
            const { data, error } = await db.supabase
                .from('ordenes_mantenimiento')
                .update(updateData)
                .eq('id_orden', id)
                .select('*')
                .single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            `UPDATE ordenes_mantenimiento SET
                diagnostico = COALESCE($1, diagnostico),
                fecha_inicio = COALESCE($2, fecha_inicio),
                fecha_fin = COALESCE($3, fecha_fin),
                checklist_seguridad = COALESCE($4, checklist_seguridad),
                id_usuario_tecnico = COALESCE($5, id_usuario_tecnico)
             WHERE id_orden = $6 RETURNING *`,
            [diagnostico, fecha_inicio, fecha_fin, checklist_seguridad, id_usuario_tecnico, id]
        );
        return rows[0] || null;
    }

    async remove(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('ordenes_mantenimiento').delete()
                .eq('id_orden', id).select('*').single();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'DELETE FROM ordenes_mantenimiento WHERE id_orden = $1 RETURNING *', [id]
        );
        return rows[0] || null;
    }

    // HU-08: Registrar consumo de repuestos (el trigger descuenta stock automáticamente)
    async registrarConsumo(id_orden, { id_repuesto, cantidad_usada }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('consumo_repuestos')
                .insert({ id_orden, id_repuesto, cantidad_usada })
                .select('*')
                .single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `INSERT INTO consumo_repuestos (id_orden, id_repuesto, cantidad_usada)
             VALUES ($1,$2,$3) RETURNING *`,
            [id_orden, id_repuesto, cantidad_usada]
        );
        return rows[0];
    }

    async getConsumos(id_orden) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('consumo_repuestos')
                .select('*, repuestos(nombre)')
                .eq('id_orden', id_orden);
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `SELECT cr.*, r.nombre AS repuesto_nombre
             FROM consumo_repuestos cr
             LEFT JOIN repuestos r ON r.id_repuesto = cr.id_repuesto
             WHERE cr.id_orden = $1`,
            [id_orden]
        );
        return rows;
    }
}

export default MaintenanceModel;
