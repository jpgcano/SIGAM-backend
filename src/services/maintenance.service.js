class MaintenanceService {
    constructor(model) { this.model = model; }

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
        return this.model.registrarConsumo(id_orden, payload);
    }

    getConsumos(id_orden) { return this.model.getConsumos(id_orden); }
}

export default MaintenanceService;