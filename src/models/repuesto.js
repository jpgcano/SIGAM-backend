import db from '../config/db.js';

class RepuestoModel {
    async findAll() {
        const { rows } = await db.query('SELECT * FROM repuestos ORDER BY id_repuesto');
        return rows;
    }
    async findById(id) {
        const { rows } = await db.query('SELECT * FROM repuestos WHERE id_repuesto = $1', [id]);
        return rows[0] || null;
    }
    async findBajoStock() {
        const { rows } = await db.query('SELECT * FROM vw_repuestos_bajo_stock');
        return rows;
    }
    async create({ nombre, stock, stock_minimo }) {
        const { rows } = await db.query(
            `INSERT INTO repuestos (nombre, stock, stock_minimo) VALUES ($1,$2,$3) RETURNING *`,
            [nombre, stock ?? 0, stock_minimo ?? 5]
        );
        return rows[0];
    }
    async update(id, { nombre, stock, stock_minimo }) {
        const { rows } = await db.query(
            `UPDATE repuestos SET
                nombre = COALESCE($1, nombre),
                stock = COALESCE($2, stock),
                stock_minimo = COALESCE($3, stock_minimo)
             WHERE id_repuesto = $4 RETURNING *`,
            [nombre, stock, stock_minimo, id]
        );
        return rows[0] || null;
    }
    async remove(id) {
        const { rows } = await db.query('DELETE FROM repuestos WHERE id_repuesto = $1 RETURNING *', [id]);
        return rows[0] || null;
    }
}

export default RepuestoModel;