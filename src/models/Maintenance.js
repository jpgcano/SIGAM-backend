import BaseModel from './BaseModel.js';


// Data access for maintenance orders and consumptions.
class MaintenanceModel extends BaseModel {
    // List maintenance orders with ticket and technician info.
    async findAll({ limit, offset } = {}) {
        if (this.useSupabase) {
            let query = this.supabase
                .from('ordenes_mantenimiento')
                .select(`
                    *,
                    tickets(id_ticket, descripcion, estado),
                    usuarios(nombre)
                `)
                .order('id_orden', { ascending: false });
            if (limit !== undefined && offset !== undefined) {
                query = query.range(offset, offset + limit - 1);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
        const params = [];
        let sql = `SELECT om.*, t.descripcion AS ticket_descripcion, t.estado AS ticket_estado,
                        u.nombre AS tecnico_nombre
                   FROM ordenes_mantenimiento om
                   LEFT JOIN tickets t ON t.id_ticket = om.id_ticket
                   LEFT JOIN usuarios u ON u.id_usuario = om.id_usuario_tecnico
                   ORDER BY om.id_orden DESC`;
        if (limit !== undefined && offset !== undefined) {
            params.push(limit, offset);
            sql += ' LIMIT $1 OFFSET $2';
        }
        const { rows } = await this.query(sql, params);
        return rows;
    }

    // Fetch a maintenance order by id with related ticket info.
    async findById(id) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
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
        const { rows } = await this.query(
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

    // List maintenance orders assigned to a technician.
    async findByTecnico(id_tecnico, { limit, offset } = {}) {
        if (this.useSupabase) {
            let query = this.supabase
                .from('ordenes_mantenimiento')
                .select('*, tickets(descripcion, estado, prioridad_ia)')
                .eq('id_usuario_tecnico', id_tecnico)
                .order('id_orden', { ascending: false });
            if (limit !== undefined && offset !== undefined) {
                query = query.range(offset, offset + limit - 1);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
        const params = [id_tecnico];
        let sql = `SELECT om.*, t.descripcion AS ticket_descripcion,
                        t.estado AS ticket_estado, t.prioridad_ia
                   FROM ordenes_mantenimiento om
                   LEFT JOIN tickets t ON t.id_ticket = om.id_ticket
                   WHERE om.id_usuario_tecnico = $1
                   ORDER BY om.id_orden DESC`;
        if (limit !== undefined && offset !== undefined) {
            params.push(limit, offset);
            sql += ' LIMIT $2 OFFSET $3';
        }
        const { rows } = await this.query(sql, params);
        return rows;
    }

    // List maintenance orders for a specific asset.
    async findByActivo(id_activo, { limit, offset } = {}) {
        const params = [id_activo];
        let sql = `SELECT om.*, t.descripcion AS ticket_descripcion, t.estado AS ticket_estado,
                        t.prioridad_ia, t.id_activo, u.nombre AS tecnico_nombre
                   FROM ordenes_mantenimiento om
                   LEFT JOIN tickets t ON t.id_ticket = om.id_ticket
                   LEFT JOIN usuarios u ON u.id_usuario = om.id_usuario_tecnico
                   WHERE t.id_activo = $1
                   ORDER BY om.id_orden DESC`;
        if (limit !== undefined && offset !== undefined) {
            params.push(limit, offset);
            sql += ' LIMIT $2 OFFSET $3';
        }
        const { rows } = await this.query(sql, params);
        return rows;
    }

    // Create a maintenance order with optional fields.
    async create({ id_ticket, id_usuario_tecnico, diagnostico, acciones_realizadas, fecha_inicio, fecha_fin, checklist_seguridad }) {
        return this.dbCreate('ordenes_mantenimiento', {
            id_ticket,
            id_usuario_tecnico,
            diagnostico,
            acciones_realizadas,
            fecha_inicio: fecha_inicio || null,
            fecha_fin: fecha_fin || null,
            checklist_seguridad: checklist_seguridad ?? false
        });
    }

    // Update a maintenance order by id.
    async update(id, { diagnostico, acciones_realizadas, fecha_inicio, fecha_fin, checklist_seguridad, id_usuario_tecnico }) {
        return this.dbUpdate('ordenes_mantenimiento', 'id_orden', id, {
            diagnostico,
            acciones_realizadas,
            fecha_inicio,
            fecha_fin,
            checklist_seguridad,
            id_usuario_tecnico
        });
    }

    // Update a maintenance order using the linked ticket id.
    async updateByTicketId(id_ticket, { diagnostico, acciones_realizadas, fecha_inicio, fecha_fin, checklist_seguridad, id_usuario_tecnico }) {
        return this.dbUpdate('ordenes_mantenimiento', 'id_ticket', id_ticket, {
            diagnostico,
            acciones_realizadas,
            fecha_inicio,
            fecha_fin,
            checklist_seguridad,
            id_usuario_tecnico
        });
    }

    // Upsert a maintenance order by ticket id (create if missing).
    async upsertByTicketId(id_ticket, payload) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('ordenes_mantenimiento')
                .select('id_orden')
                .eq('id_ticket', id_ticket)
                .maybeSingle();
            if (error) throw error;
            if (data?.id_orden) {
                return this.update(data.id_orden, payload);
            }
            return this.create({ id_ticket, ...payload });
        }
        const { rows } = await this.query(
            `SELECT id_orden
             FROM ordenes_mantenimiento
             WHERE id_ticket = $1
             LIMIT 1`,
            [id_ticket]
        );
        if (rows?.[0]?.id_orden) {
            return this.update(rows[0].id_orden, payload);
        }
        return this.create({ id_ticket, ...payload });
    }

    // Remove a maintenance order.
    async remove(id) {
        return this.dbRemove('ordenes_mantenimiento', 'id_orden', id);
    }

    // HU-08: Register spare part consumption with transactional SQL function.
    async registrarConsumo(id_orden, { id_repuesto, cantidad_usada, estado_ticket }) {
        const { rows } = await this.query(
            `SELECT * FROM fn_registrar_consumo_ticket($1,$2,$3,$4)`,
            [id_orden, id_repuesto, cantidad_usada, estado_ticket]
        );
        return rows[0];
    }

    // List spare parts consumption for a maintenance order.
    async getConsumos(id_orden) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('consumo_repuestos')
                .select('*, repuestos(nombre)')
                .eq('id_orden', id_orden);
            if (error) throw error;
            return data;
        }
        const { rows } = await this.query(
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
