import db from '../config/db.js';

class UserModel {
    async findByEmail(email) {
        const { data, error } = await db.supabase
            .from('usuarios')
            .select('id_usuario, nombre, email, password_hash, rol')
            .eq('email', email)
            .maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async findAll() {
        const { data, error } = await db.supabase
            .from('usuarios')
            .select('id_usuario, nombre, email, rol, fecha_creacion')
            .order('id_usuario', { ascending: true });
        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await db.supabase
            .from('usuarios')
            .select('id_usuario, nombre, email, rol, fecha_creacion')
            .eq('id_usuario', id)
            .maybeSingle();
        if (error) throw error;
        return data || null;
    }

    async create({ nombre, email, passwordHash, rol }) {
        const { data, error } = await db.supabase
            .from('usuarios')
            .insert({ nombre, email, password_hash: passwordHash, rol })
            .select('id_usuario, nombre, email, rol, fecha_creacion')
            .single();
        if (error) throw error;
        return data;
    }

    async update(id, { nombre, email, rol }) {
        const { data, error } = await db.supabase
            .from('usuarios')
            .update({ nombre, email, rol })
            .eq('id_usuario', id)
            .select('id_usuario, nombre, email, rol, fecha_creacion')
            .single();
        if (error) throw error;
        return data;
    }

    async remove(id) {
        const { data, error } = await db.supabase
            .from('usuarios')
            .delete()
            .eq('id_usuario', id)
            .select('id_usuario, nombre, email')
            .single();
        if (error) throw error;
        return data;
    }
}

export default UserModel;
