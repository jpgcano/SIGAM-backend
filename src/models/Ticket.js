import { supabase } from '../lib/supabase.js';

class TicketModel {
    async findAll() {
        const { data, error } = await supabase.from('tickets').select('*').order('id_ticket', { ascending: false });
        if (error) {
            throw error;
        }
        return data;
    }

    async create({ id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp }) {
        const { data, error } = await supabase
            .from('tickets')
            .insert({
                id_activo,
                id_usuario_reporta,
                descripcion,
                prioridad_ia,
                clasificacion_nlp
            })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}

export default TicketModel;
