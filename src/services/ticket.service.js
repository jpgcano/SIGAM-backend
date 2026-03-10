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
        return this.model.create(payload);
    }

    async update(id, payload, user) {
        if (payload?.estado !== undefined) {
            await this.changeEstado(id, payload.estado, user);
            const updateData = { ...payload };
            delete updateData.estado;
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

    async changeEstado(id, estado, user) {
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
