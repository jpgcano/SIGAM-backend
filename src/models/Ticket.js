import db from '../config/db.js';
const OPEN_TICKET_STATES = ['Abierto', 'Asignado', 'En Proceso'];
const SUPPORT_ROLES = new Set(['tecnico', 'soporte']);

function normalizeRole(rol) {
    return String(rol || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

class TicketModel {
    async findAll() {
        const { data, error } = await db.supabase
            .from('vw_tickets_operacion')
            .select('*')
            .order('id_ticket', { ascending: false });
        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await db.supabase
            .from('vw_tickets_operacion')
            .select('*')
            .eq('id_ticket', id)
            .maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async findByActivo(id_activo) {
        const { data, error } = await db.supabase
            .from('vw_tickets_operacion')
            .select('*')
            .eq('id_activo', id_activo)
            .order('id_ticket', { ascending: false });
        if (error) throw error;
        return data;
    }

    async findSupportTechnicianWithLeastLoad() {
        const { data: users, error: usersError } = await db.supabase
            .from('usuarios')
            .select('id_usuario, nombre, rol');
        if (usersError) throw usersError;

        const technicians = (users || []).filter((u) => SUPPORT_ROLES.has(normalizeRole(u.rol)));
        if (!technicians.length) return null;

        const techIds = technicians.map((t) => t.id_usuario);
        const { data: maintRows, error: maintError } = await db.supabase
            .from('ordenes_mantenimiento')
            .select('id_usuario_tecnico, tickets(estado)')
            .in('id_usuario_tecnico', techIds);
        if (maintError) throw maintError;

        const loadByTech = new Map(techIds.map((id) => [id, 0]));
        for (const row of maintRows || []) {
            const state = row?.tickets?.estado;
            if (OPEN_TICKET_STATES.includes(state)) {
                const current = loadByTech.get(row.id_usuario_tecnico) || 0;
                loadByTech.set(row.id_usuario_tecnico, current + 1);
            }
        }

        const selected = [...technicians].sort((a, b) => {
            const loadDiff = (loadByTech.get(a.id_usuario) || 0) - (loadByTech.get(b.id_usuario) || 0);
            if (loadDiff !== 0) return loadDiff;
            return a.id_usuario - b.id_usuario;
        })[0];

        return {
            id_usuario: selected.id_usuario,
            nombre: selected.nombre,
            carga_abierta: loadByTech.get(selected.id_usuario) || 0
        };
    }

    async create({ id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp }) {
        const tecnico = await this.findSupportTechnicianWithLeastLoad();
        if (!tecnico) {
            throw { status: 409, message: 'No hay técnicos de soporte disponibles para asignar el ticket' };
        }

        const { data, error } = await db.supabase
            .from('tickets')
            .insert({
                id_activo,
                id_usuario_reporta,
                descripcion,
                prioridad_ia,
                clasificacion_nlp,
                estado: 'Asignado'
            })
            .select('*')
            .single();
        if (error) throw error;

        const { error: assignError } = await db.supabase
            .from('ordenes_mantenimiento')
            .insert({
                id_ticket: data.id_ticket,
                id_usuario_tecnico: tecnico.id_usuario
            });
        if (assignError) throw assignError;

        return {
            ...data,
            id_usuario_tecnico: tecnico.id_usuario,
            tecnico_asignado: tecnico.nombre
        };
    }

    async update(id, { prioridad_ia, clasificacion_nlp, estado }) {
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

    async updateEstado(id, estado) {
        const { data, error } = await db.supabase
            .from('tickets')
            .update({ estado })
            .eq('id_ticket', id)
            .select('*')
            .single();
        if (error) throw error;
        return data || null;
    }

    async isReportedByUser(id_ticket, id_usuario) {
        const { data, error } = await db.supabase
            .from('tickets')
            .select('id_ticket')
            .eq('id_ticket', id_ticket)
            .eq('id_usuario_reporta', id_usuario)
            .limit(1);
        if (error) throw error;
        return Array.isArray(data) && data.length > 0;
    }

    async closeWithConsumos(id_ticket, consumos) {
        if (!Array.isArray(consumos) || consumos.length === 0) {
            throw { status: 400, message: 'consumos es requerido' };
        }

        const values = [];
        const params = [id_ticket];
        consumos.forEach((item) => {
            values.push(`($${params.length + 1}, $${params.length + 2})`);
            params.push(item.id_repuesto, item.cantidad_usada);
        });

        const sql = `
            WITH orden AS (
                SELECT id_orden FROM ordenes_mantenimiento WHERE id_ticket = $1
            ),
            ins AS (
                INSERT INTO consumo_repuestos (id_orden, id_repuesto, cantidad_usada)
                SELECT orden.id_orden, v.id_repuesto, v.cantidad_usada
                FROM orden
                JOIN (VALUES ${values.join(', ')}) AS v(id_repuesto, cantidad_usada) ON true
                RETURNING 1
            ),
            upd AS (
                UPDATE tickets
                SET estado = 'Cerrado'
                WHERE id_ticket = $1 AND EXISTS (SELECT 1 FROM orden)
                RETURNING *
            )
            SELECT
                (SELECT COUNT(*) FROM orden) AS orden_exists,
                (SELECT COUNT(*) FROM ins) AS inserted,
                (SELECT id_ticket FROM upd) AS id_ticket
        `;

        const { rows } = await db.query(sql, params);
        const meta = rows?.[0];
        if (!meta || Number(meta.orden_exists) === 0) {
            throw { status: 404, message: `Orden no encontrada para ticket ${id_ticket}` };
        }
        if (!meta.id_ticket) {
            throw { status: 404, message: `Ticket ${id_ticket} no encontrado` };
        }
        return this.findById(id_ticket);
    }

    async isAssignedToTecnico(id_ticket, id_tecnico) {
        const { data, error } = await db.supabase
            .from('ordenes_mantenimiento')
            .select('id_orden')
            .eq('id_ticket', id_ticket)
            .eq('id_usuario_tecnico', id_tecnico)
            .limit(1);
        if (error) throw error;
        return Array.isArray(data) && data.length > 0;
    }

    async remove(id) {
        const { data, error } = await db.supabase
            .from('tickets').delete().eq('id_ticket', id).select('*').single();
        if (error) throw error;
        return data || null;
    }

    async getMetrics({ id_activo } = {}) {
        const { rows } = await db.query(
            `WITH mttr AS (
                SELECT AVG(EXTRACT(EPOCH FROM (om.fecha_fin - om.fecha_inicio))) AS mttr_seconds,
                       COUNT(*) AS reparaciones
                FROM ordenes_mantenimiento om
                JOIN tickets t ON t.id_ticket = om.id_ticket
                WHERE om.fecha_inicio IS NOT NULL AND om.fecha_fin IS NOT NULL
                  AND t.estado IN ('Resuelto', 'Cerrado')
                  AND ($1::int IS NULL OR t.id_activo = $1::int)
             ),
             mtbf AS (
                SELECT AVG(EXTRACT(EPOCH FROM (fecha_creacion - prev_fecha))) AS mtbf_seconds,
                       COUNT(*) AS intervalos
                FROM (
                    SELECT id_activo, fecha_creacion,
                           LAG(fecha_creacion) OVER (PARTITION BY id_activo ORDER BY fecha_creacion) AS prev_fecha
                    FROM tickets
                    WHERE estado IN ('Resuelto', 'Cerrado')
                      AND ($1::int IS NULL OR id_activo = $1::int)
                ) x
                WHERE prev_fecha IS NOT NULL
             )
             SELECT
                COALESCE(mttr.mttr_seconds, 0) AS mttr_seconds,
                COALESCE(mtbf.mtbf_seconds, 0) AS mtbf_seconds,
                COALESCE(mttr.reparaciones, 0) AS reparaciones,
                COALESCE(mtbf.intervalos, 0) AS intervalos
             FROM mttr, mtbf`,
            [id_activo ?? null]
        );
        return rows[0] || {
            mttr_seconds: 0,
            mtbf_seconds: 0,
            reparaciones: 0,
            intervalos: 0
        };
    }
}

export default TicketModel;
