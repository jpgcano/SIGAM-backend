import db from '../config/db.js';

class LicenciaModel {
    async findAll() {
        const { data, error } = await db.supabase
            .from('vw_licencias_ocupacion').select('*').order('id_licencia', { ascending: true });
        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await db.supabase
            .from('vw_licencias_ocupacion').select('*').eq('id_licencia', id).maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async create({ id_software, clave_producto, fecha_expiracion, asientos_totales }) {
        const { data, error } = await db.supabase
            .from('licencias')
            .insert({ id_software, clave_producto, fecha_expiracion, asientos_totales: asientos_totales ?? 1 })
            .select().single();
        if (error) throw error;
        return data;
    }

    async update(id, { fecha_expiracion, asientos_totales }) {
        const updateData = {};
        if (fecha_expiracion !== undefined) updateData.fecha_expiracion = fecha_expiracion;
        if (asientos_totales !== undefined) updateData.asientos_totales = asientos_totales;
        const { data, error } = await db.supabase
            .from('licencias').update(updateData)
            .eq('id_licencia', id).select().single();
        if (error) throw error;
        return data || null;
    }

    async remove(id) {
        const { data, error } = await db.supabase
            .from('licencias').delete().eq('id_licencia', id).select().single();
        if (error) throw error;
        return data || null;
    }

    async asignar({ id_licencia, id_usuario, id_activo }) {
        const { data, error } = await db.supabase
            .from('asignacion_licencias')
            .insert({ id_licencia, id_usuario: id_usuario || null, id_activo: id_activo || null })
            .select().single();
        if (error) throw error;
        return data;
    }

    async getAsignaciones(id_licencia) {
        const { data, error } = await db.supabase
            .from('asignacion_licencias')
            .select('*, usuarios(nombre), activos(serial)')
            .eq('id_licencia', id_licencia);
        if (error) throw error;
        return data;
    }

    async revocarAsignacion(id_asignacion) {
        const { data, error } = await db.supabase
            .from('asignacion_licencias').delete()
            .eq('id_asignacion', id_asignacion).select().single();
        if (error) throw error;
        return data || null;
    }
}

export default LicenciaModel;
