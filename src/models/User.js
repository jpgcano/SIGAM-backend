const db = require('../config/db');

class UserModel {
    async findByEmail(email) {
        const sql = 'SELECT id_usuario, nombre, email, password_hash, rol FROM usuarios WHERE email = $1';
        const { rows } = await db.query(sql, [email]);
        return rows[0] || null;
    }

    async findAll() {
        const sql = 'SELECT id_usuario, nombre, email, rol, fecha_creacion FROM usuarios ORDER BY id_usuario';
        const { rows } = await db.query(sql);
        return rows;
    }

    async create({ nombre, email, passwordHash, rol }) {
        const sql = `
            INSERT INTO usuarios (nombre, email, password_hash, rol)
            VALUES ($1, $2, $3, $4)
            RETURNING id_usuario, nombre, email, rol, fecha_creacion
        `;
        const { rows } = await db.query(sql, [nombre, email, passwordHash, rol]);
        return rows[0];
    }
}

module.exports = UserModel;
