class LicenciaService {
    constructor(model) { this.model = model; }
    findAll() { return this.model.findAll(); }
    async findById(id) {
        const r = await this.model.findById(id);
        if (!r) throw { status: 404, message: `Licencia ${id} no encontrada` };
        return r;
    }
    create(payload) {
        if (!payload.clave_producto) throw { status: 400, message: 'clave_producto es requerido' };
        return this.model.create(payload);
    }
    async update(id, payload) {
        const r = await this.model.update(id, payload);
        if (!r) throw { status: 404, message: `Licencia ${id} no encontrada` };
        return r;
    }
    async remove(id) {
        const r = await this.model.remove(id);
        if (!r) throw { status: 404, message: `Licencia ${id} no encontrada` };
        return r;
    }
    asignar(payload) { return this.model.asignar(payload); }
    getAsignaciones(id) { return this.model.getAsignaciones(id); }
    async revocarAsignacion(id) {
        const r = await this.model.revocarAsignacion(id);
        if (!r) throw { status: 404, message: `Asignación ${id} no encontrada` };
        return r;
    }
}
export default LicenciaService;