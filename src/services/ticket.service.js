function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function inferClassification(description) {
    const text = normalizeText(description);
    const rules = [
        { label: 'Hardware', keywords: ['pantalla', 'disco', 'teclado', 'mouse', 'ram', 'bateria', 'fuente', 'ventilador'] },
        { label: 'Software', keywords: ['sistema', 'programa', 'aplicacion', 'licencia', 'actualizacion', 'instalacion', 'office', 'windows'] },
        { label: 'Red', keywords: ['red', 'internet', 'wifi', 'router', 'switch', 'latencia', 'conexion', 'dns'] },
        { label: 'Eléctrico', keywords: ['voltaje', 'corriente', 'energia', 'tomacorriente', 'breaker', 'ups', 'corto', 'quemado'] }
    ];

    for (const rule of rules) {
        if (rule.keywords.some((keyword) => text.includes(keyword))) {
            return rule.label;
        }
    }
    return null;
}

function inferPriority(description) {
    const text = normalizeText(description);
    if (text.includes('quemado')) return 'Alta';
    return 'Media';
}

class TicketService {
    constructor(model) { this.model = model; }
    static ESTADOS_VALIDOS = new Set(['Abierto', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado']);

    findAll() { return this.model.findAll(); }

    async findById(id) {
        const t = await this.model.findById(id);
        if (!t) throw { status: 404, message: `Ticket ${id} no encontrado` };
        return t;
    }

    findByActivo(id_activo) { return this.model.findByActivo(id_activo); }

    findAssignedByTecnico(id_tecnico) { return this.model.findAssignedByTecnico(id_tecnico); }

    create(payload) {
        if (!payload.descripcion) throw { status: 400, message: 'descripcion es requerida' };
        if (!payload.id_activo) throw { status: 400, message: 'id_activo es requerido' };

        const normalizedPayload = {
            ...payload,
            clasificacion_nlp: inferClassification(payload.descripcion),
            prioridad_ia: inferPriority(payload.descripcion)
        };

        return this.model.create(normalizedPayload);
    }

    async update(id, payload, user) {
        if (payload?.estado !== undefined) {
            await this.changeEstado(id, payload.estado, user, payload?.consumos);
            const updateData = { ...payload };
            delete updateData.estado;
            delete updateData.consumos;
            if (Object.keys(updateData).length === 0) {
                const current = await this.model.findById(id);
                if (!current) throw { status: 404, message: `Ticket ${id} no encontrado` };
                return current;
            }
            const updated = await this.model.update(id, updateData);
            if (!updated) throw { status: 404, message: `Ticket ${id} no encontrado` };
            return updated;
        }
        const t = await this.model.update(id, payload);
        if (!t) throw { status: 404, message: `Ticket ${id} no encontrado` };
        return t;
    }

    async changeEstado(id, estado, user, consumos) {
        if (!estado) throw { status: 400, message: 'estado es requerido' };
        if (!TicketService.ESTADOS_VALIDOS.has(estado)) {
            throw { status: 400, message: `estado inválido: ${estado}` };
        }

        // Regla de negocio: un técnico solo puede cerrar tickets asignados a él.
        if (user?.role === 'Técnico' && estado === 'Cerrado') {
            const assigned = await this.model.isAssignedToTecnico(id, user.id);
            if (!assigned) {
                throw { status: 403, message: 'El ticket no está asignado a este técnico' };
            }
        }

        if (estado === 'Cerrado' && Array.isArray(consumos) && consumos.length) {
            for (const item of consumos) {
                if (!item?.id_repuesto) {
                    throw { status: 400, message: 'consumos.id_repuesto es requerido' };
                }
                const qty = Number(item.cantidad_usada);
                if (!Number.isFinite(qty) || qty <= 0) {
                    throw { status: 400, message: 'consumos.cantidad_usada debe ser > 0' };
                }
            }
            return this.model.closeWithConsumos(id, consumos);
        }

        const t = await this.model.updateEstado(id, estado);
        if (!t) throw { status: 404, message: `Ticket ${id} no encontrado` };
        return t;
    }

    async remove(id) {
        const t = await this.model.remove(id);
        if (!t) throw { status: 404, message: `Ticket ${id} no encontrado` };
        return t;
    }
}

export default TicketService;
