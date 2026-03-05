import db from '../config/db.js';

class MaintenanceModel {
    async findAll() {
        const { rows } = await db.query('SELECT * FROM ordenes_mantenimiento ORDER BY id_orden DESC');
        return rows;
    }

    async create({ id_ticket, id_usuario_tecnico, diagnostico, fecha_inicio, fecha_fin, checklist_seguridad }) {
        const sql = `
            INSERT INTO ordenes_mantenimiento (
                id_ticket, id_usuario_tecnico, diagnostico, fecha_inicio, fecha_fin, checklist_seguridad
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const { rows } = await db.query(sql, [
            id_ticket,
            id_usuario_tecnico,
            diagnostico,
            fecha_inicio || null,
            fecha_fin || null,
            checklist_seguridad ?? false
        ]);

        return rows[0];
    }
}

export default MaintenanceModel;
