import db from '../config/db.js';

class ProveedorModel {
    async findAll() {
        const { data, error } = await db.supabase
            .from('proveedores').select('*').order('id_proveedor', { ascending: true });
        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await db.supabase
            .from('proveedores').select('*').eq('id_proveedor', id).maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async create({ nombre, contacto, identificacion_legal }) {
        const { data, error } = await db.supabase
            .from('proveedores')
            .insert({ nombre, contacto, identificacion_legal })
            .select().single();
        if (error) throw error;
        return data;
    }

    async update(id, { nombre, contacto }) {
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (contacto !== undefined) updateData.contacto = contacto;
        const { data, error } = await db.supabase
            .from('proveedores').update(updateData)
            .eq('id_proveedor', id).select().single();
        if (error) throw error;
        return data || null;
    }

    async remove(id) {
        const { data, error } = await db.supabase
            .from('proveedores').delete().eq('id_proveedor', id).select().single();
        if (error) throw error;
        return data || null;
    }
}

export default ProveedorModel;
