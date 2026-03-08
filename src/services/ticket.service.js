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
        return this.model.create(payload);
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