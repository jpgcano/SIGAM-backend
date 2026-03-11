import db from '../config/db.js';

function toMillis(value) {
    if (!value) return null;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? null : t;
}

function averageHours(durationsMs) {
    if (!durationsMs.length) return null;
    const sum = durationsMs.reduce((acc, v) => acc + v, 0);
    return sum / durationsMs.length / 3600000;
}

function buildMetrics(rows) {
    const mttrSamples = [];
    const ticketsByActivo = new Map();

    for (const row of rows) {
        const inicio = toMillis(row.fecha_inicio);
        const fin = toMillis(row.fecha_fin);
        if (inicio !== null && fin !== null && fin >= inicio) {
            mttrSamples.push(fin - inicio);
        }

        const creado = toMillis(row.fecha_creacion);
        if (creado !== null && row.id_activo !== null && row.id_activo !== undefined) {
            const list = ticketsByActivo.get(row.id_activo) || [];
            list.push(creado);
            ticketsByActivo.set(row.id_activo, list);
        }
    }

    const mtbfSamples = [];
    for (const times of ticketsByActivo.values()) {
        if (times.length < 2) continue;
        times.sort((a, b) => a - b);
        for (let i = 1; i < times.length; i += 1) {
            const diff = times[i] - times[i - 1];
            if (diff >= 0) mtbfSamples.push(diff);
        }
    }

    return {
        mttr_hours: averageHours(mttrSamples),
        mtbf_hours: averageHours(mtbfSamples),
        mttr_samples: mttrSamples.length,
        mtbf_samples: mtbfSamples.length
    };
}

class MetricsModel {
    async getOperationalMetrics() {
        const { data, error } = await db.supabase
            .from('tickets')
            .select('id_activo, fecha_creacion, ordenes_mantenimiento(fecha_inicio, fecha_fin)');
        if (error) throw error;

        const rows = (data || []).map((row) => ({
            id_activo: row.id_activo,
            fecha_creacion: row.fecha_creacion,
            fecha_inicio: row.ordenes_mantenimiento?.fecha_inicio || null,
            fecha_fin: row.ordenes_mantenimiento?.fecha_fin || null
        }));

        return buildMetrics(rows);
    }
}

export default MetricsModel;
