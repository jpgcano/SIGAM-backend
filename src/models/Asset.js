import BaseModel from './BaseModel.js';


class AssetModel extends BaseModel {
    async findAll() {
        return this.dbFindAll('vw_activos_detalle', 'id_activo');
    }

    async findById(id) {
        return this.dbFindById('vw_activos_detalle', 'id_activo', id);
    }

    async findBySerial(serial) {
        return this.dbFindById('activos', 'serial', serial, ['id_activo', 'serial']);
    }

    async create(payload) {
        const {
            serial, modelo, fecha_compra, vida_util, codigo_qr,
            nivel_criticidad, especificaciones_electricas,
            id_ubicacion, id_categoria, id_proveedor
        } = payload;

        let activo;

        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('activos')
                .insert({
                    serial, codigo_qr, modelo, fecha_compra, vida_util,
                    nivel_criticidad: nivel_criticidad || 'Media',
                    especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor
                })
                .select().single();
            if (error) throw error;
            activo = data;

            await this.supabase.from('historial_activos').insert({
                id_activo: activo.id_activo,
                tipo_evento: 'Registro',
                detalle: 'Activo creado en el sistema'
            });
        } else {
            const { rows } = await this.query(
                `INSERT INTO activos (serial, codigo_qr, modelo, fecha_compra, vida_util, nivel_criticidad,
                    especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
                [serial, codigo_qr, modelo, fecha_compra, vida_util, nivel_criticidad || 'Media',
                especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor]
            );
            activo = rows[0];
            await this.query(
                `INSERT INTO historial_activos (id_activo, tipo_evento, detalle)
                 VALUES ($1, 'Registro', 'Activo creado en el sistema')`,
                [activo.id_activo]
            );
        }
        return activo;
    }

    async update(id, payload) {
        const { modelo, vida_util, nivel_criticidad, especificaciones_electricas, estado_activo,
                id_ubicacion, id_categoria, id_proveedor } = payload;

        if (this.useSupabase) {
            const updateData = {};
            if (modelo !== undefined) updateData.modelo = modelo;
            if (vida_util !== undefined) updateData.vida_util = vida_util;
            if (nivel_criticidad !== undefined) updateData.nivel_criticidad = nivel_criticidad;
            if (especificaciones_electricas !== undefined) updateData.especificaciones_electricas = especificaciones_electricas;
            if (estado_activo !== undefined) updateData.estado_activo = estado_activo;
            if (id_ubicacion !== undefined) updateData.id_ubicacion = id_ubicacion;
            if (id_categoria !== undefined) updateData.id_categoria = id_categoria;
            if (id_proveedor !== undefined) updateData.id_proveedor = id_proveedor;

            const { data, error } = await this.supabase
                .from('activos').update(updateData)
                .eq('id_activo', id).select().single();
            if (error) throw error;
            return data || null;
        }

        const { rows } = await this.query(
            `UPDATE activos SET
                modelo = COALESCE($1, modelo), vida_util = COALESCE($2, vida_util),
                nivel_criticidad = COALESCE($3, nivel_criticidad),
                especificaciones_electricas = COALESCE($4, especificaciones_electricas),
                estado_activo = COALESCE($5, estado_activo),
                id_ubicacion = COALESCE($6, id_ubicacion), id_categoria = COALESCE($7, id_categoria),
                id_proveedor = COALESCE($8, id_proveedor)
             WHERE id_activo = $9 RETURNING *`,
            [modelo, vida_util, nivel_criticidad, especificaciones_electricas, estado_activo,
            id_ubicacion, id_categoria, id_proveedor, id]
        );
        return rows[0] || null;
    }

    async remove(id, motivoBaja, certificadoBorrado) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('bajas_activos')
                .insert({
                    id_activo: id,
                    fecha_baja: new Date().toISOString().split('T')[0],
                    motivo: motivoBaja,
                    borrado_seguro: certificadoBorrado
                }).select().single();
            if (error) throw error;
            return data;
        }
        const { rows } = await this.query(
            `INSERT INTO bajas_activos (id_activo, fecha_baja, motivo, borrado_seguro)
             VALUES ($1, CURRENT_DATE, $2, $3) RETURNING *`,
            [id, motivoBaja, certificadoBorrado]
        );
        return rows[0];
    }

    async getHistory(id) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('historial_activos').select('*')
                .eq('id_activo', id).order('fecha_evento', { ascending: false });
            if (error) throw error;
            return data;
        }
        const { rows } = await this.query(
            `SELECT * FROM historial_activos WHERE id_activo = $1 ORDER BY fecha_evento DESC`, [id]
        );
        return rows;
    }

    async addHistory(id_activo, tipo_evento, detalle) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('historial_activos')
                .insert({ id_activo, tipo_evento, detalle })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
        const { rows } = await this.query(
            `INSERT INTO historial_activos (id_activo, tipo_evento, detalle)
             VALUES ($1, $2, $3) RETURNING *`,
            [id_activo, tipo_evento, detalle]
        );
        return rows[0];
    }
}

export default AssetModel;

