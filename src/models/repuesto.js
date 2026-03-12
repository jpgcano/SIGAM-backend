import BaseModel from './BaseModel.js';


class RepuestoModel extends BaseModel {
    async findAll() {
        return this.dbFindAll('repuestos', 'id_repuesto');
    }

    async findById(id) {
        return this.dbFindById('repuestos', 'id_repuesto', id);
    }

    async findBajoStock() {
        return this.dbFindAll('vw_repuestos_bajo_stock');
    }

    async create({ nombre, stock, stock_minimo }) {
        return this.dbCreate('repuestos', {
            nombre,
            stock: stock ?? 0,
            stock_minimo: stock_minimo ?? 5
        });
    }

    async update(id, { nombre, stock, stock_minimo }) {
        return this.dbUpdate('repuestos', 'id_repuesto', id, {
            nombre,
            stock,
            stock_minimo
        });
    }

    async remove(id) {
        return this.dbRemove('repuestos', 'id_repuesto', id);
    }

    async getConsumptionWindowByRepuesto({ windowDays = 60 } = {}) {
        const days = Number(windowDays);
        if (!Number.isInteger(days) || days <= 0 || days > 3650) {
            throw { status: 400, message: 'windowDays inválido' };
        }

        const { rows } = await this.query(
            `WITH consumo AS (
                SELECT
                    cr.id_repuesto,
                    SUM(cr.cantidad_usada)::numeric AS consumido_window
                FROM consumo_repuestos cr
                JOIN ordenes_mantenimiento om ON om.id_orden = cr.id_orden
                LEFT JOIN tickets t ON t.id_ticket = om.id_ticket
                WHERE COALESCE(om.fecha_fin, om.fecha_inicio, t.fecha_creacion, NOW()) >= NOW() - ($1 * INTERVAL '1 day')
                GROUP BY cr.id_repuesto
            )
            SELECT
                r.id_repuesto,
                r.nombre,
                r.stock,
                r.stock_minimo,
                COALESCE(c.consumido_window, 0) AS consumido_window
            FROM repuestos r
            LEFT JOIN consumo c ON c.id_repuesto = r.id_repuesto
            ORDER BY r.id_repuesto ASC`,
            [days]
        );
        return rows || [];
    }
}

export default RepuestoModel;
