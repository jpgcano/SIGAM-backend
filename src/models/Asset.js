import db from '../config/db.js';

const useSupabase = (process.env.DB_MODE || 'postgres').toLowerCase() === 'supabase';

class AssetModel {
    async findAll() {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('vw_activos_detalle')
                .select('*')
                .order('id_activo', { ascending: true });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query('SELECT * FROM vw_activos_detalle ORDER BY id_activo');
        return rows;
    }

    async findById(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('vw_activos_detalle')
                .select('*')
                .eq('id_activo', id)
                .maybeSingle();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query('SELECT * FROM vw_activos_detalle WHERE id_activo = $1', [id]);
        return rows[0] || null;
    }

    async findBySerial(serial) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('activos')
                .select('id_activo, serial')
                .eq('serial', serial)
                .maybeSingle();
            if (error) throw error;
            return data || null;
        }
        const { rows } = await db.query(
            'SELECT id_activo, serial FROM activos WHERE serial = $1',
            [serial]
        );
        return rows[0] || null;
    }

    async create(payload) {
        const {
            serial, modelo, fecha_compra, vida_util, codigo_qr,
            nivel_criticidad, especificaciones_electricas,
            id_ubicacion, id_categoria, id_proveedor
        } = payload;

        let activo;

        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('activos')
                .insert({
                    serial, codigo_qr, modelo, fecha_compra, vida_util,
                    nivel_criticidad: nivel_criticidad || 'Media',
                    especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor
                })
                .select().single();
            if (error) throw error;
            activo = data;

            await db.supabase.from('historial_activos').insert({
                id_activo: activo.id_activo,
                tipo_evento: 'Registro',
                detalle: 'Activo creado en el sistema'
            });
        } else {
            const { rows } = await db.query(
                `INSERT INTO activos (serial, codigo_qr, modelo, fecha_compra, vida_util, nivel_criticidad,
                    especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
                [serial, codigo_qr, modelo, fecha_compra, vida_util, nivel_criticidad || 'Media',
                especificaciones_electricas, id_ubicacion, id_categoria, id_proveedor]
            );
            activo = rows[0];
            await db.query(
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

        if (useSupabase) {
            const updateData = {};
            if (modelo !== undefined) updateData.modelo = modelo;
            if (vida_util !== undefined) updateData.vida_util = vida_util;
            if (nivel_criticidad !== undefined) updateData.nivel_criticidad = nivel_criticidad;
            if (especificaciones_electricas !== undefined) updateData.especificaciones_electricas = especificaciones_electricas;
            if (estado_activo !== undefined) updateData.estado_activo = estado_activo;
            if (id_ubicacion !== undefined) updateData.id_ubicacion = id_ubicacion;
            if (id_categoria !== undefined) updateData.id_categoria = id_categoria;
            if (id_proveedor !== undefined) updateData.id_proveedor = id_proveedor;

            const { data, error } = await db.supabase
                .from('activos').update(updateData)
                .eq('id_activo', id).select().single();
            if (error) throw error;
            return data || null;
        }

        const { rows } = await db.query(
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
        if (useSupabase) {
            const { data, error } = await db.supabase
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
        const { rows } = await db.query(
            `INSERT INTO bajas_activos (id_activo, fecha_baja, motivo, borrado_seguro)
             VALUES ($1, CURRENT_DATE, $2, $3) RETURNING *`,
            [id, motivoBaja, certificadoBorrado]
        );
        return rows[0];
    }

    async getHistory(id) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('historial_activos').select('*')
                .eq('id_activo', id).order('fecha_evento', { ascending: false });
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `SELECT * FROM historial_activos WHERE id_activo = $1 ORDER BY fecha_evento DESC`, [id]
        );
        return rows;
    }

    async addHistory(id_activo, tipo_evento, detalle) {
        if (useSupabase) {
            const { data, error } = await db.supabase
                .from('historial_activos')
                .insert({ id_activo, tipo_evento, detalle })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
        const { rows } = await db.query(
            `INSERT INTO historial_activos (id_activo, tipo_evento, detalle)
             VALUES ($1, $2, $3) RETURNING *`,
            [id_activo, tipo_evento, detalle]
        );
        return rows[0];
    }
}

export default AssetModel;
