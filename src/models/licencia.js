import db from '../config/db.js';

class LicenciaModel {
    async findAll() {
        const { rows } = await db.query('SELECT * FROM vw_licencias_ocupacion ORDER BY id_licencia');
        return rows;
    }
    async findById(id) {
        const { rows } = await db.query(
            'SELECT * FROM vw_licencias_ocupacion WHERE id_licencia = $1', [id]
        );
        return rows[0] || null;
    }
    async create({ id_software, clave_producto, fecha_expiracion, asientos_totales }) {
        const { rows } = await db.query(
            `INSERT INTO licencias (id_software, clave_producto, fecha_expiracion, asientos_totales)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [id_software, clave_producto, fecha_expiracion, asientos_totales ?? 1]
        );
        return rows[0];
    }
    async update(id, { fecha_expiracion, asientos_totales }) {
        const { rows } = await db.query(
            `UPDATE licencias SET
                fecha_expiracion = COALESCE($1, fecha_expiracion),
                asientos_totales = COALESCE($2, asientos_totales)
             WHERE id_licencia = $3 RETURNING *`,
            [fecha_expiracion, asientos_totales, id]
        );
        return rows[0] || null;
    }
    async remove(id) {
        const { rows } = await db.query('DELETE FROM licencias WHERE id_licencia = $1 RETURNING *', [id]);
        return rows[0] || null;
    }
    // HU-03: Asignar licencia a usuario o activo
    async asignar({ id_licencia, id_usuario, id_activo }) {
        const { rows } = await db.query(
            `INSERT INTO asignacion_licencias (id_licencia, id_usuario, id_activo)
             VALUES ($1,$2,$3) RETURNING *`,
            [id_licencia, id_usuario || null, id_activo || null]
        );
        return rows[0];
    }
    async getAsignaciones(id_licencia) {
        const { rows } = await db.query(
            `SELECT al.*, u.nombre as usuario, a.serial as activo
             FROM asignacion_licencias al
             LEFT JOIN usuarios u ON u.id_usuario = al.id_usuario
             LEFT JOIN activos a ON a.id_activo = al.id_activo
             WHERE al.id_licencia = $1`,
            [id_licencia]
        );
        return rows;
    }
    async revocarAsignacion(id_asignacion) {
        const { rows } = await db.query(
            'DELETE FROM asignacion_licencias WHERE id_asignacion = $1 RETURNING *', [id_asignacion]
        );
        return rows[0] || null;
    }
}

export default LicenciaModel;