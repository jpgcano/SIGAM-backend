import buildAuditContext from '../utils/auditContext.js';

class AssetController {
    constructor(assetService) {
        this.assetService = assetService;
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
        this.getHistory = this.getHistory.bind(this);
    }

    async getAll(req, res, next) {
        try {
            const assets = await this.assetService.findAll();
            res.json(assets);
        } catch (error) { next(error); }
    }

    async getById(req, res, next) {
        try {
            const asset = await this.assetService.findById(req.params.id);
            res.json(asset);
        } catch (error) { next(error); }
    }

    async create(req, res, next) {
        try {
            const asset = await this.assetService.create(req.body, req.user, buildAuditContext(req));
            res.status(201).json(asset);
        } catch (error) { next(error); }
    }

    async update(req, res, next) {
        try {
            const asset = await this.assetService.update(req.params.id, req.body, req.user, buildAuditContext(req));
            res.json(asset);
        } catch (error) { next(error); }
    }

    async remove(req, res, next) {
        try {
            const { motivo_baja, certificado_borrado } = req.body;
            const result = await this.assetService.remove(
                req.params.id,
                motivo_baja,
                certificado_borrado,
                req.user,
                buildAuditContext(req)
            );
            res.json({ message: 'Activo dado de baja correctamente (ISO 27001)', data: result });
        } catch (error) { next(error); }
    }

    async getHistory(req, res, next) {
        try {
            const history = await this.assetService.getHistory(req.params.id);
            res.json(history);
        } catch (error) { next(error); }
    }
}

export default AssetController;
