import db from '../config/db.js';

class UbicacionModel {
    async findAll() {
        const { data, error } = await db.supabase
            .from('ubicaciones').select('*').order('id_ubicacion', { ascending: true });
        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await db.supabase
            .from('ubicaciones').select('*').eq('id_ubicacion', id).maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async create({ sede, piso, sala }) {
        const { data, error } = await db.supabase
            .from('ubicaciones').insert({ sede, piso, sala }).select().single();
        if (error) throw error;
        return data;
    }

    async update(id, { sede, piso, sala }) {
        const updateData = {};
        if (sede !== undefined) updateData.sede = sede;
        if (piso !== undefined) updateData.piso = piso;
        if (sala !== undefined) updateData.sala = sala;
        const { data, error } = await db.supabase
            .from('ubicaciones').update(updateData)
            .eq('id_ubicacion', id).select().single();
        if (error) throw error;
        return data || null;
    }

    async remove(id) {
        const { data, error } = await db.supabase
            .from('ubicaciones').delete().eq('id_ubicacion', id).select().single();
        if (error) throw error;
        return data || null;
    }
}

export default UbicacionModel;
