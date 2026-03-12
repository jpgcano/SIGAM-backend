import BaseModel from './BaseModel.js';


class LicenciaModel extends BaseModel {
    async findAll() {
        return this.dbFindAll('vw_licencias_ocupacion', 'id_licencia');
    }

    async findById(id) {
        return this.dbFindById('vw_licencias_ocupacion', 'id_licencia', id);
    }

    async create({ id_software, clave_producto, fecha_expiracion, asientos_totales }) {
        return this.dbCreate('licencias', {
            id_software,
            clave_producto,
            fecha_expiracion,
            asientos_totales: asientos_totales ?? 1
        });
    }

    async update(id, { fecha_expiracion, asientos_totales }) {
        return this.dbUpdate('licencias', 'id_licencia', id, {
            fecha_expiracion,
            asientos_totales
        });
    }

    async remove(id) {
        return this.dbRemove('licencias', 'id_licencia', id);
    }

    async asignar({ id_licencia, id_usuario, id_activo }) {
        return this.dbCreate('asignacion_licencias', {
            id_licencia,
            id_usuario: id_usuario || null,
            id_activo: id_activo || null
        });
    }

    async getAsignaciones(id_licencia) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('asignacion_licencias')
                .select('*, usuarios(nombre), activos(serial)')
                .eq('id_licencia', id_licencia);
            if (error) throw error;
            return data;
        }
        const { rows } = await this.query(
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
        return this.dbRemove('asignacion_licencias', 'id_asignacion', id_asignacion);
    }
}

export default LicenciaModel;
