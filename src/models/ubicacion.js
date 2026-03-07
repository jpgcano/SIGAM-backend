import db from '../config/db.js';

class UbicacionModel {
    async findAll() {
        const { rows } = await db.query('SELECT * FROM ubicaciones ORDER BY id_ubicacion');
        return rows;
    }
    async findById(id) {
        const { rows } = await db.query('SELECT * FROM ubicaciones WHERE id_ubicacion = $1', [id]);
        return rows[0] || null;
    }
    async create({ sede, piso, sala }) {
        const { rows } = await db.query(
            `INSERT INTO ubicaciones (sede, piso, sala) VALUES ($1,$2,$3) RETURNING *`,
            [sede, piso, sala]
        );
        return rows[0];
    }
    async update(id, { sede, piso, sala }) {
        const { rows } = await db.query(
            `UPDATE ubicaciones SET
                sede = COALESCE($1, sede),
                piso = COALESCE($2, piso),
                sala = COALESCE($3, sala)
             WHERE id_ubicacion = $4 RETURNING *`,
            [sede, piso, sala, id]
        );
        return rows[0] || null;
    }
    async remove(id) {
        const { rows } = await db.query('DELETE FROM ubicaciones WHERE id_ubicacion = $1 RETURNING *', [id]);
        return rows[0] || null;
    }
}

export default UbicacionModel;