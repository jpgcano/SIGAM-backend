import { supabase } from '../lib/supabase.js';

class UserModel {
    async findByEmail(email) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id_usuario, nombre, email, password_hash, rol')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data || null;
    }

    async findAll() {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id_usuario, nombre, email, rol, fecha_creacion')
            .order('id_usuario', { ascending: true });

        if (error) {
            throw error;
        }

        return data;
    }

    async create({ nombre, email, passwordHash, rol }) {
        const { data, error } = await supabase
            .from('usuarios')
            .insert({
                nombre,
                email,
                password_hash: passwordHash,
                rol
            })
            .select('id_usuario, nombre, email, rol, fecha_creacion')
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}

export default UserModel;
