const db = require('../config/db');

class AssetModel {
    async findAll() {
        const { rows } = await db.query('SELECT * FROM activos ORDER BY id_activo');
        return rows;
    }

    async create(payload) {
        const {
            serial,
            modelo,
            fecha_compra,
            vida_util,
            nivel_criticidad,
            especificaciones_electricas,
            id_ubicacion,
            id_categoria,
            id_proveedor
        } = payload;

        const sql = `
            INSERT INTO activos (
                serial, modelo, fecha_compra, vida_util, nivel_criticidad,
                especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *
        `;

        const { rows } = await db.query(sql, [
            serial,
            modelo,
            fecha_compra,
            vida_util,
            nivel_criticidad || 'Media',
            especificaciones_electricas,
            id_ubicacion,
            id_categoria,
            id_proveedor
        ]);

        return rows[0];
    }
}

module.exports = AssetModel;
