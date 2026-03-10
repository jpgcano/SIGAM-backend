class MaintenanceService {
    constructor(model) { this.model = model; }
    static ESTADOS_VALIDOS = new Set(['Abierto', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado']);

    findAll() { return this.model.findAll(); }

    async findById(id) {
        const m = await this.model.findById(id);
        if (!m) throw { status: 404, message: `Orden ${id} no encontrada` };
        return m;
    }

    findByTecnico(id_tecnico) { return this.model.findByTecnico(id_tecnico); }

    create(payload) {
        if (!payload.id_ticket) throw { status: 400, message: 'id_ticket es requerido' };
        if (!payload.id_usuario_tecnico) throw { status: 400, message: 'id_usuario_tecnico es requerido' };
        return this.model.create(payload);
    }

    async update(id, payload) {
        const m = await this.model.update(id, payload);
        if (!m) throw { status: 404, message: `Orden ${id} no encontrada` };
        return m;
    }

    async remove(id) {
        const m = await this.model.remove(id);
        if (!m) throw { status: 404, message: `Orden ${id} no encontrada` };
        return m;
    }

    // HU-08: Registrar consumo de repuesto
    registrarConsumo(id_orden, payload) {
        if (!payload.id_repuesto) throw { status: 400, message: 'id_repuesto es requerido' };
        if (!payload.cantidad_usada) throw { status: 400, message: 'cantidad_usada es requerida' };
        if (payload.cantidad_usada <= 0) throw { status: 400, message: 'cantidad_usada debe ser mayor que 0' };

        const estado_ticket = payload.estado_ticket || 'En Proceso';
        if (!MaintenanceService.ESTADOS_VALIDOS.has(estado_ticket)) {
            throw { status: 400, message: `estado_ticket inválido: ${estado_ticket}` };
        }

        return this.model.registrarConsumo(id_orden, { ...payload, estado_ticket });
    }

    getConsumos(id_orden) { return this.model.getConsumos(id_orden); }
}

export default MaintenanceService;
