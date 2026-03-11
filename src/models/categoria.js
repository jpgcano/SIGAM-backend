import db from '../config/db.js';

class CategoriaModel {
    async findAll() {
        const { data, error } = await db.supabase
            .from('categorias')
            .select('*')
            .order('id_categoria', { ascending: true });
        if (error) throw error;
        return data;
    }
}

export default CategoriaModel;
