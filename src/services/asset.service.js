class AssetService {
    constructor(assetModel) {
        this.assetModel = assetModel;
    }

    async findAll() {
        return this.assetModel.findAll();
    }

    async findById(id) {
        const asset = await this.assetModel.findById(id);
        if (!asset) throw { status: 404, message: `Activo con id ${id} no encontrado` };
        return asset;
    }

    async create(payload) {
        return this.assetModel.create(payload);
    }

    async update(id, payload) {
        const asset = await this.assetModel.update(id, payload);
        if (!asset) throw { status: 404, message: `Activo con id ${id} no encontrado` };
        return asset;
    }

    async remove(id, motivoBaja, certificadoBorrado) {
        if (!motivoBaja || !certificadoBorrado) {
            throw { status: 400, message: 'motivo_baja y certificado_borrado son requeridos (ISO 27001)' };
        }
        return this.assetModel.remove(id, motivoBaja, certificadoBorrado);
    }

    async getHistory(id) {
        return this.assetModel.getHistory(id);
    }
}

export default AssetService;