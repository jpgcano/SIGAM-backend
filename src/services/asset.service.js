class AssetService {
    constructor(assetModel) {
        this.assetModel = assetModel;
    }

    async findAll() {
        return this.assetModel.findAll();
    }

    async create(payload) {
        return this.assetModel.create(payload);
    }
}

module.exports = AssetService;
