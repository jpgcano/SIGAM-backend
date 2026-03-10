class SoftwareController {
    constructor(service) {
        this.service = service;
        ['getAll', 'getById', 'create', 'update', 'remove']
            .forEach((m) => { this[m] = this[m].bind(this); });
    }

    async getAll(req, res, next) {
        try { res.json(await this.service.findAll()); } catch (e) { next(e); }
    }

    async getById(req, res, next) {
        try { res.json(await this.service.findById(req.params.id)); } catch (e) { next(e); }
    }

    async create(req, res, next) {
        try { res.status(201).json(await this.service.create(req.body)); } catch (e) { next(e); }
    }

    async update(req, res, next) {
        try { res.json(await this.service.update(req.params.id, req.body)); } catch (e) { next(e); }
    }

    async remove(req, res, next) {
        try {
            await this.service.remove(req.params.id);
            res.json({ message: 'Software eliminado' });
        } catch (e) { next(e); }
    }
}

export default SoftwareController;
