import db from '../config/db.js';

class MaintenanceModel {
    async findAll() {
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

    async findById(id) {
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

    async findByTecnico(id_tecnico) {
        const { data, error } = await db.supabase
            .from('ordenes_mantenimiento')
            .select('*, tickets(descripcion, estado, prioridad_ia)')
            .eq('id_usuario_tecnico', id_tecnico)
            .order('id_orden', { ascending: false });
        if (error) throw error;
        return data;
    }

    async create({ id_ticket, id_usuario_tecnico, diagnostico, fecha_inicio, fecha_fin, checklist_seguridad }) {
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

    async update(id, { diagnostico, fecha_inicio, fecha_fin, checklist_seguridad, id_usuario_tecnico }) {
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

    async remove(id) {
        const { data, error } = await db.supabase
            .from('ordenes_mantenimiento').delete()
            .eq('id_orden', id).select('*').single();
        if (error) throw error;
        return data || null;
    }

    // HU-08: Registrar consumo + cambio de estado (funcion SQL transaccional)
    async registrarConsumo(id_orden, { id_repuesto, cantidad_usada, estado_ticket }) {
        const { rows } = await db.query(
            `SELECT * FROM fn_registrar_consumo_ticket($1,$2,$3,$4)`,
            [id_orden, id_repuesto, cantidad_usada, estado_ticket]
        );
        return rows[0];
    }

    async getConsumos(id_orden) {
        const { data, error } = await db.supabase
            .from('consumo_repuestos')
            .select('*, repuestos(nombre)')
            .eq('id_orden', id_orden);
        if (error) throw error;
        return data;
    }
}

export default MaintenanceModel;
