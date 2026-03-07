import { supabase } from '../lib/supabase.js';

class MaintenanceModel {
    async findAll() {
        const { data, error } = await supabase
            .from('ordenes_mantenimiento')
            .select('*')
            .order('id_orden', { ascending: false });
        if (error) {
            throw error;
        }
        return data;
    }

    async create({ id_ticket, id_usuario_tecnico, diagnostico, fecha_inicio, fecha_fin, checklist_seguridad }) {
        const { data, error } = await supabase
            .from('ordenes_mantenimiento')
            .insert({
                id_ticket,
                id_usuario_tecnico,
                diagnostico,
                fecha_inicio: fecha_inicio || null,
                fecha_fin: fecha_fin || null,
                checklist_seguridad: checklist_seguridad ?? false
            })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}

export default MaintenanceModel;
