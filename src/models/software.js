import db from '../config/db.js';

class SoftwareModel {
    async findAll() {
        const { data, error } = await db.supabase
            .from('software').select('*').order('id_software', { ascending: true });
        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await db.supabase
            .from('software').select('*').eq('id_software', id).maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async create({ nombre, fabricante }) {
        const { data, error } = await db.supabase
            .from('software')
            .insert({ nombre, fabricante })
            .select().single();
        if (error) throw error;
        return data;
    }

    async update(id, { nombre, fabricante }) {
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (fabricante !== undefined) updateData.fabricante = fabricante;
        const { data, error } = await db.supabase
            .from('software').update(updateData)
            .eq('id_software', id).select().single();
        if (error) throw error;
        return data || null;
    }

    async remove(id) {
        const { data, error } = await db.supabase
            .from('software').delete().eq('id_software', id).select().single();
        if (error) throw error;
        return data || null;
    }
}

export default SoftwareModel;
