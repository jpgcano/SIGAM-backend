import { supabase } from '../lib/supabase.js';

class AssetModel {
    async findAll() {
        const { data, error } = await supabase.from('activos').select('*').order('id_activo', { ascending: true });
        if (error) {
            throw error;
        }
        return data;
    }

    async create(payload) {
        const {
            serial,
            modelo,
            fecha_compra,
            vida_util,
            nivel_criticidad,
            especificaciones_electricas,
            id_ubicacion,
            id_categoria,
            id_proveedor
        } = payload;

        const { data, error } = await supabase
            .from('activos')
            .insert({
                serial,
                modelo,
                fecha_compra,
                vida_util,
                nivel_criticidad: nivel_criticidad || 'Media',
                especificaciones_electricas,
                id_ubicacion,
                id_categoria,
                id_proveedor
            })
            .select('*')
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}

export default AssetModel;
