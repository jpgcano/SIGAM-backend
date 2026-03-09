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

    findAll() { return this.model.findAll(); }

    async findById(id) {
        const t = await this.model.findById(id);
        if (!t) throw { status: 404, message: `Ticket ${id} no encontrado` };
        return t;
    }

    findByActivo(id_activo) { return this.model.findByActivo(id_activo); }

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

    async update(id, payload) {
        const t = await this.model.update(id, payload);
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
