class AssetController {
    constructor(assetService) {
        this.assetService = assetService;
        this.getAll = this.getAll.bind(this);
        this.create = this.create.bind(this);
    }

    async getAll(req, res, next) {
        try {
            const assets = await this.assetService.findAll();
            res.json(assets);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const asset = await this.assetService.create(req.body);
            res.status(201).json(asset);
        } catch (error) {
            next(error);
        }
    }
}

export default AssetController;
