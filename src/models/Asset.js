import db from '../config/db.js';

class AssetModel {
    async findAll() {
        const { data, error } = await db.supabase
            .from('vw_activos_detalle')
            .select('*')
            .order('id_activo', { ascending: true });
        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await db.supabase
            .from('vw_activos_detalle')
            .select('*')
            .eq('id_activo', id)
            .maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async findBySerial(serial) {
        const { data, error } = await db.supabase
            .from('activos')
            .select('id_activo, serial')
            .eq('serial', serial)
            .maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async create(payload) {
        const {
            serial, modelo, fecha_compra, vida_util, codigo_qr,
            nivel_criticidad, especificaciones_electricas,
            id_ubicacion, id_categoria, id_proveedor
        } = payload;

        let activo;

        const { data, error } = await db.supabase
            .from('activos')
            .insert({
                serial, codigo_qr, modelo, fecha_compra, vida_util,
                nivel_criticidad: nivel_criticidad || 'Media',
                especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor
            })
            .select().single();
        if (error) throw error;
        activo = data;

        await db.supabase.from('historial_activos').insert({
            id_activo: activo.id_activo,
            tipo_evento: 'Registro',
            detalle: 'Activo creado en el sistema'
        });
        return activo;
    }

    async update(id, payload) {
        const { modelo, vida_util, nivel_criticidad, especificaciones_electricas, estado_activo,
                id_ubicacion, id_categoria, id_proveedor } = payload;

        const updateData = {};
        if (modelo !== undefined) updateData.modelo = modelo;
        if (vida_util !== undefined) updateData.vida_util = vida_util;
        if (nivel_criticidad !== undefined) updateData.nivel_criticidad = nivel_criticidad;
        if (especificaciones_electricas !== undefined) updateData.especificaciones_electricas = especificaciones_electricas;
        if (estado_activo !== undefined) updateData.estado_activo = estado_activo;
        if (id_ubicacion !== undefined) updateData.id_ubicacion = id_ubicacion;
        if (id_categoria !== undefined) updateData.id_categoria = id_categoria;
        if (id_proveedor !== undefined) updateData.id_proveedor = id_proveedor;

        const { data, error } = await db.supabase
            .from('activos').update(updateData)
            .eq('id_activo', id).select().single();
        if (error) throw error;
        return data || null;
    }

    async remove(id, motivoBaja, certificadoBorrado) {
        const { data, error } = await db.supabase
            .from('bajas_activos')
            .insert({
                id_activo: id,
                fecha_baja: new Date().toISOString().split('T')[0],
                motivo: motivoBaja,
                borrado_seguro: certificadoBorrado
            }).select().single();
        if (error) throw error;
        return data;
    }

    async getHistory(id) {
        const { data, error } = await db.supabase
            .from('historial_activos').select('*')
            .eq('id_activo', id).order('fecha_evento', { ascending: false });
        if (error) throw error;
        return data;
    }

    async addHistory(id_activo, tipo_evento, detalle) {
        const { data, error } = await db.supabase
            .from('historial_activos')
            .insert({ id_activo, tipo_evento, detalle })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
}

export default AssetModel;
