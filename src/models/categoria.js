import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class CategoriaModel {
    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('categorias')
                .select('*')
                .order('id_categoria', { ascending: true });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query('SELECT * FROM categorias ORDER BY id_categoria');
        return rows;
    }
}

export default CategoriaModel;
