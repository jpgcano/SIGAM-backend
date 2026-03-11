import db from '../config/db.js';

class RepuestoModel {
    async findAll() {
        const { data, error } = await db.supabase
            .from('repuestos').select('*').order('id_repuesto', { ascending: true });
        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await db.supabase
            .from('repuestos').select('*').eq('id_repuesto', id).maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async findBajoStock() {
        const { data, error } = await db.supabase
            .from('vw_repuestos_bajo_stock').select('*');
        if (error) throw error;
        return data;
    }

    async create({ nombre, stock, stock_minimo }) {
        const { data, error } = await db.supabase
            .from('repuestos')
            .insert({ nombre, stock: stock ?? 0, stock_minimo: stock_minimo ?? 5 })
            .select().single();
        if (error) throw error;
        return data;
    }

    async update(id, { nombre, stock, stock_minimo }) {
        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (stock !== undefined) updateData.stock = stock;
        if (stock_minimo !== undefined) updateData.stock_minimo = stock_minimo;
        const { data, error } = await db.supabase
            .from('repuestos').update(updateData)
            .eq('id_repuesto', id).select().single();
        if (error) throw error;
        return data || null;
    }

    async remove(id) {
        const { data, error } = await db.supabase
            .from('repuestos').delete().eq('id_repuesto', id).select().single();
        if (error) throw error;
        return data || null;
    }
}

export default RepuestoModel;
