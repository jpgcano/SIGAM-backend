class UbicacionService {
    constructor(model) { this.model = model; }
    findAll() { return this.model.findAll(); }
    async findById(id) {
        const r = await this.model.findById(id);
        if (!r) throw { status: 404, message: `Ubicacion ${id} no encontrada` };
        return r;
    }
    create(payload) {
        if (!payload.sede) throw { status: 400, message: 'sede es requerido' };
        return this.model.create(payload);
    }
    async update(id, payload) {
        const r = await this.model.update(id, payload);
        if (!r) throw { status: 404, message: `Ubicacion ${id} no encontrada` };
        return r;
    }
    async remove(id) {
        const r = await this.model.remove(id);
        if (!r) throw { status: 404, message: `Ubicacion ${id} no encontrada` };
        return r;
    }
}
export default UbicacionService;