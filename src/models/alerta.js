import BaseModel from './BaseModel.js';

class AlertaModel extends BaseModel {
    async findPendingByTipoAndRepuesto(tipo, id_repuesto) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('alertas')
                .select('id_alerta')
                .eq('tipo', tipo)
                .eq('id_repuesto', id_repuesto)
                .eq('estado', 'Pendiente')
                .limit(1);
            if (error) throw error;
            return Array.isArray(data) && data.length ? data[0] : null;
        }
        const { rows } = await this.query(
            `SELECT id_alerta
             FROM alertas
             WHERE tipo = $1 AND id_repuesto = $2 AND estado = 'Pendiente'
             LIMIT 1`,
            [tipo, id_repuesto]
        );
        return rows?.[0] || null;
    }

    async create({ tipo, id_activo = null, id_repuesto = null, id_licencia = null, estado = 'Pendiente' }) {
        return this.dbCreate('alertas', { tipo, id_activo, id_repuesto, id_licencia, estado });
    }

    async ensurePendingByTipoAndRepuesto(tipo, id_repuesto) {
        const existing = await this.findPendingByTipoAndRepuesto(tipo, id_repuesto);
        if (existing) return { created: false, id_alerta: existing.id_alerta };
        const created = await this.create({ tipo, id_repuesto, estado: 'Pendiente' });
        return { created: true, id_alerta: created?.id_alerta || null };
    }

    async findPendingByTipoAndActivo(tipo, id_activo) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('alertas')
                .select('id_alerta')
                .eq('tipo', tipo)
                .eq('id_activo', id_activo)
                .eq('estado', 'Pendiente')
                .limit(1);
            if (error) throw error;
            return Array.isArray(data) && data.length ? data[0] : null;
        }
        const { rows } = await this.query(
            `SELECT id_alerta
             FROM alertas
             WHERE tipo = $1 AND id_activo = $2 AND estado = 'Pendiente'
             LIMIT 1`,
            [tipo, id_activo]
        );
        return rows?.[0] || null;
    }

    async ensurePendingByTipoAndActivo(tipo, id_activo) {
        const existing = await this.findPendingByTipoAndActivo(tipo, id_activo);
        if (existing) return { created: false, id_alerta: existing.id_alerta };
        const created = await this.create({ tipo, id_activo, estado: 'Pendiente' });
        return { created: true, id_alerta: created?.id_alerta || null };
    }

    async findPendingByTipoAndLicencia(tipo, id_licencia) {
        if (this.useSupabase) {
            const { data, error } = await this.supabase
                .from('alertas')
                .select('id_alerta')
                .eq('tipo', tipo)
                .eq('id_licencia', id_licencia)
                .eq('estado', 'Pendiente')
                .limit(1);
            if (error) throw error;
            return Array.isArray(data) && data.length ? data[0] : null;
        }
        const { rows } = await this.query(
            `SELECT id_alerta
             FROM alertas
             WHERE tipo = $1 AND id_licencia = $2 AND estado = 'Pendiente'
             LIMIT 1`,
            [tipo, id_licencia]
        );
        return rows?.[0] || null;
    }

    async ensurePendingByTipoAndLicencia(tipo, id_licencia) {
        const existing = await this.findPendingByTipoAndLicencia(tipo, id_licencia);
        if (existing) return { created: false, id_alerta: existing.id_alerta };
        const created = await this.create({ tipo, id_licencia, estado: 'Pendiente' });
        return { created: true, id_alerta: created?.id_alerta || null };
    }
}

export default AlertaModel;
