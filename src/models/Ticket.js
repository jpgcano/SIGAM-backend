const db = require('../config/db');

class TicketModel {
    async findAll() {
        const { rows } = await db.query('SELECT * FROM tickets ORDER BY id_ticket DESC');
        return rows;
    }

    async create({ id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp }) {
        const sql = `
            INSERT INTO tickets (id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const { rows } = await db.query(sql, [id_activo, id_usuario_reporta, descripcion, prioridad_ia, clasificacion_nlp]);
        return rows[0];
    }
}

module.exports = TicketModel;
