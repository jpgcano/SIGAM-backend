import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';
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

    async findSupportTechnicianWithLeastLoad() {
        if (useSupabase) {
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

        const { rows } = await db.query(
            `SELECT
                u.id_usuario,
                u.nombre,
                COUNT(t.id_ticket) AS carga_abierta
             FROM usuarios u
             LEFT JOIN ordenes_mantenimiento om ON om.id_usuario_tecnico = u.id_usuario
             LEFT JOIN tickets t
                ON t.id_ticket = om.id_ticket
               AND t.estado IN ('Abierto', 'Asignado', 'En Proceso')
             WHERE lower(translate(u.rol, 'ÁÉÍÓÚáéíóú', 'AEIOUaeiou')) IN ('tecnico', 'soporte')
             GROUP BY u.id_usuario, u.nombre
             ORDER BY COUNT(t.id_ticket) ASC, u.id_usuario ASC
             LIMIT 1`
        );

        if (!rows.length) return null;
        return rows[0];
    }

    async create({ id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp }) {
        const tecnico = await this.findSupportTechnicianWithLeastLoad();
        if (!tecnico) {
            throw { status: 409, message: 'No hay técnicos de soporte disponibles para asignar el ticket' };
        }

        if (useSupabase) {
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
        const { rows } = await db.query(
            `INSERT INTO tickets (id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp, estado)
             VALUES ($1,$2,$3,$4,$5,'Asignado') RETURNING *`,
            [id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp]
        );
        const ticket = rows[0];

        await db.query(
            `INSERT INTO ordenes_mantenimiento (id_ticket, id_usuario_tecnico)
             VALUES ($1, $2)`,
            [ticket.id_ticket, tecnico.id_usuario]
        );

        return {
            ...ticket,
            id_usuario_tecnico: tecnico.id_usuario,
            tecnico_asignado: tecnico.nombre
        };
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

    async isReportedByUser(id_ticket, id_usuario) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('tickets')
                .select('id_ticket')
                .eq('id_ticket', id_ticket)
                .eq('id_usuario_reporta', id_usuario)
                .limit(1);
            if (error) throw error;
            return Array.isArray(data) && data.length > 0;
        }
        const { rows } = await db.query(
            `SELECT 1
             FROM tickets
             WHERE id_ticket = $1
               AND id_usuario_reporta = $2
             LIMIT 1`,
            [id_ticket, id_usuario]
        );
        return rows.length > 0;
    }

    async closeWithConsumos(id_ticket, consumos) {
        if (!Array.isArray(consumos) || consumos.length === 0) {
            throw { status: 400, message: 'consumos es requerido' };
        }

        if (useSupabase) {
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

        if (typeof db.transaction !== 'function') {
            throw { status: 500, message: 'Transacciones no soportadas en el adaptador actual' };
        }

        return db.transaction(async (client) => {
            const order = await client.query(
                'SELECT id_orden FROM ordenes_mantenimiento WHERE id_ticket = $1',
                [id_ticket]
            );
            const id_orden = order.rows?.[0]?.id_orden;
            if (!id_orden) {
                throw { status: 404, message: `Orden no encontrada para ticket ${id_ticket}` };
            }

            for (const item of consumos) {
                await client.query(
                    `INSERT INTO consumo_repuestos (id_orden, id_repuesto, cantidad_usada)
                     VALUES ($1,$2,$3)`,
                    [id_orden, item.id_repuesto, item.cantidad_usada]
                );
            }

            const updated = await client.query(
                `UPDATE tickets SET estado = 'Cerrado' WHERE id_ticket = $1 RETURNING *`,
                [id_ticket]
            );
            if (!updated.rows?.length) {
                throw { status: 404, message: `Ticket ${id_ticket} no encontrado` };
            }
            return updated.rows[0];
        });
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
