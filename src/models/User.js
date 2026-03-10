import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class UserModel {
    async findByEmail(email) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('usuarios')
                .select('id_usuario, nombre, email, password_hash, rol')
                .eq('email', email)
                .maybeSingle();
            if (error) throw error;
            return data || null;
        }

        const { rows } = await db.query(
            `SELECT id_usuario, nombre, email, password_hash, rol FROM usuarios WHERE email = $1`,
            [email]
        );
        return rows[0] || null;
    }

    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('usuarios')
                .select('id_usuario, nombre, email, rol, fecha_creacion')
                .order('id_usuario', { ascending: true });
            if (error) throw error;
            return data;
        }

        const { rows } = await db.query(
            `SELECT id_usuario, nombre, email, rol, fecha_creacion FROM usuarios ORDER BY id_usuario`
        );
        return rows;
    }

    async findById(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('usuarios')
                .select('id_usuario, nombre, email, rol, fecha_creacion')
                .eq('id_usuario', id)
                .maybeSingle();
            if (error) throw error;
            return data || null;
        }

        const { rows } = await db.query(
            `SELECT id_usuario, nombre, email, rol, fecha_creacion FROM usuarios WHERE id_usuario = $1`,
            [id]
        );
        return rows[0] || null;
    }

    async create({ nombre, email, passwordHash, rol }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('usuarios')
                .insert({ nombre, email, password_hash: passwordHash, rol })
                .select('id_usuario, nombre, email, rol, fecha_creacion')
                .single();
            if (error) throw error;
            return data;
        }

        const { rows } = await db.query(
            `INSERT INTO usuarios (nombre, email, password_hash, rol)
             VALUES ($1, $2, $3, $4)
             RETURNING id_usuario, nombre, email, rol, fecha_creacion`,
            [nombre, email, passwordHash, rol]
        );
        return rows[0];
    }

    async update(id, { nombre, email, rol }) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('usuarios')
                .update({ nombre, email, rol })
                .eq('id_usuario', id)
                .select('id_usuario, nombre, email, rol, fecha_creacion')
                .single();
            if (error) throw error;
            return data;
        }

        const { rows } = await db.query(
            `UPDATE usuarios SET
                nombre = COALESCE($1, nombre),
                email  = COALESCE($2, email),
                rol    = COALESCE($3, rol)
             WHERE id_usuario = $4
             RETURNING id_usuario, nombre, email, rol, fecha_creacion`,
            [nombre, email, rol, id]
        );
        return rows[0] || null;
    }

    async remove(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('usuarios')
                .delete()
                .eq('id_usuario', id)
                .select('id_usuario, nombre, email')
                .single();
            if (error) throw error;
            return data;
        }

        const { rows } = await db.query(
            `DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario, nombre, email`,
            [id]
        );
        return rows[0] || null;
    }
}

export default UserModel;
