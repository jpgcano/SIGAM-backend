import db from '../config/db.js';

class AssetModel {
    async findAll() {
        const { rows } = await db.query('SELECT * FROM vw_activos_detalle ORDER BY id_activo');
        return rows;
    }

    async findById(id) {
        const { rows } = await db.query(
            'SELECT * FROM vw_activos_detalle WHERE id_activo = $1',
            [id]
        );
        return rows[0] || null;
    }

    async create(payload) {
        const {
            serial, modelo, fecha_compra, vida_util,
            nivel_criticidad, especificaciones_electricas,
            id_ubicacion, id_categoria, id_proveedor
        } = payload;

        const sql = `
            INSERT INTO activos (
                serial, modelo, fecha_compra, vida_util, nivel_criticidad,
                especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *
        `;
        const { rows } = await db.query(sql, [
            serial, modelo, fecha_compra, vida_util,
            nivel_criticidad || 'Media', especificaciones_electricas,
            id_ubicacion, id_categoria, id_proveedor
        ]);

        // Registrar en historial
        await db.query(
            `INSERT INTO historial_activos (id_activo, tipo_evento, detalle)
             VALUES ($1, 'Registro', 'Activo creado en el sistema')`,
            [rows[0].id_activo]
        );

        return rows[0];
    }

    async update(id, payload) {
        const {
            modelo, vida_util, nivel_criticidad,
            especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor
        } = payload;

        const sql = `
            UPDATE activos SET
                modelo = COALESCE($1, modelo),
                vida_util = COALESCE($2, vida_util),
                nivel_criticidad = COALESCE($3, nivel_criticidad),
                especificaciones_electricas = COALESCE($4, especificaciones_electricas),
                id_ubicacion = COALESCE($5, id_ubicacion),
                id_categoria = COALESCE($6, id_categoria),
                id_proveedor = COALESCE($7, id_proveedor)
            WHERE id_activo = $8
            RETURNING *
        `;
        const { rows } = await db.query(sql, [
            modelo, vida_util, nivel_criticidad,
            especificaciones_electricas, id_ubicacion,
            id_categoria, id_proveedor, id
        ]);
        return rows[0] || null;
    }

    async remove(id, motivoBaja, certificadoBorrado) {
        // Registrar baja (el trigger se encarga del historial y alerta)
        const sql = `
            INSERT INTO bajas_activos (id_activo, fecha_baja, motivo, borrado_seguro)
            VALUES ($1, CURRENT_DATE, $2, $3)
            RETURNING *
        `;
        const { rows } = await db.query(sql, [id, motivoBaja, certificadoBorrado]);
        return rows[0];
    }

    async getHistory(id) {
        const { rows } = await db.query(
            `SELECT * FROM historial_activos WHERE id_activo = $1 ORDER BY fecha_evento DESC`,
            [id]
        );
        return rows;
    }
}

export default AssetModel;
