class SoftwareService {
    constructor(model) { this.model = model; }

    findAll() { return this.model.findAll(); }

    async findById(id) {
        const s = await this.model.findById(id);
        if (!s) throw { status: 404, message: `Software ${id} no encontrado` };
        return s;
    }

    create(payload) {
        if (!payload.nombre) throw { status: 400, message: 'nombre es requerido' };
        return this.model.create(payload);
    }

    async update(id, payload) {
        const s = await this.model.update(id, payload);
        if (!s) throw { status: 404, message: `Software ${id} no encontrado` };
        return s;
    }

    async remove(id) {
        const s = await this.model.remove(id);
        if (!s) throw { status: 404, message: `Software ${id} no encontrado` };
        return s;
    }
}

export default SoftwareService;