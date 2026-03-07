class RepuestoService {
    constructor(model) { this.model = model; }
    findAll() { return this.model.findAll(); }
    findBajoStock() { return this.model.findBajoStock(); }
    async findById(id) {
        const r = await this.model.findById(id);
        if (!r) throw { status: 404, message: `Repuesto ${id} no encontrado` };
        return r;
    }
    create(payload) { return this.model.create(payload); }
    async update(id, payload) {
        const r = await this.model.update(id, payload);
        if (!r) throw { status: 404, message: `Repuesto ${id} no encontrado` };
        return r;
    }
    async remove(id) {
        const r = await this.model.remove(id);
        if (!r) throw { status: 404, message: `Repuesto ${id} no encontrado` };
        return r;
    }
}
export default RepuestoService;