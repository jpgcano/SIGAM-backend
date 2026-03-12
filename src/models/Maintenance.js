import BaseModel from './BaseModel.js';


class MaintenanceModel extends BaseModel {
    async findAll() {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
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
        const { rows } = await this.query(
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

    async findByTecnico(id_tecnico) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('ordenes_mantenimiento')
                .select('*, tickets(descripcion, estado, prioridad_ia)')
                .eq('id_usuario_tecnico', id_tecnico)
                .order('id_orden', { ascending: false });
            if (error) throw error;
            return data;
        }
        const { rows } = await this.query(
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
        return this.dbCreate('ordenes_mantenimiento', {
            id_ticket,
            id_usuario_tecnico,
            diagnostico,
            fecha_inicio: fecha_inicio || null,
            fecha_fin: fecha_fin || null,
            checklist_seguridad: checklist_seguridad ?? false
        });
    }

    async update(id, { diagnostico, fecha_inicio, fecha_fin, checklist_seguridad, id_usuario_tecnico }) {
        return this.dbUpdate('ordenes_mantenimiento', 'id_orden', id, {
            diagnostico,
            fecha_inicio,
            fecha_fin,
            checklist_seguridad,
            id_usuario_tecnico
        });
    }

    async updateByTicketId(id_ticket, { diagnostico, fecha_inicio, fecha_fin, checklist_seguridad, id_usuario_tecnico }) {
        return this.dbUpdate('ordenes_mantenimiento', 'id_ticket', id_ticket, {
            diagnostico,
            fecha_inicio,
            fecha_fin,
            checklist_seguridad,
            id_usuario_tecnico
        });
    }

    async remove(id) {
        return this.dbRemove('ordenes_mantenimiento', 'id_orden', id);
    }

    // HU-08: Registrar consumo + cambio de estado (funcion SQL transaccional)
    async registrarConsumo(id_orden, { id_repuesto, cantidad_usada, estado_ticket }) {
        const { rows } = await this.query(
            `SELECT * FROM fn_registrar_consumo_ticket($1,$2,$3,$4)`,
            [id_orden, id_repuesto, cantidad_usada, estado_ticket]
        );
        return rows[0];
    }

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
