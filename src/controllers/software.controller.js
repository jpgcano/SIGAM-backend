import buildAuditContext from '../utils/auditContext.js';

// Controller for software catalog routes.
class SoftwareController {
    constructor(service) {
        this.service = service;
        // Bind methods for Express handlers.
        ['getAll','getById','create','update','remove']
            .forEach(m => this[m] = this[m].bind(this));
    }

    // List all software entries.
    async getAll(req, res, next) {
        try { res.json(await this.service.findAll()); } catch (e) { next(e); }
    }

    // Fetch software by id.
    async getById(req, res, next) {
        try { res.json(await this.service.findById(req.params.id)); } catch (e) { next(e); }
    }

    // Create a new software entry.
    async create(req, res, next) {
        try { res.status(201).json(await this.service.create(req.body, req.user, buildAuditContext(req))); } catch (e) { next(e); }
    }

    // Update a software entry.
    async update(req, res, next) {
        try { res.json(await this.service.update(req.params.id, req.body, req.user, buildAuditContext(req))); } catch (e) { next(e); }
    }

    // Delete a software entry.
    async remove(req, res, next) {
        try {
            await this.service.remove(req.params.id, req.user, buildAuditContext(req));
            res.json({ message: 'Software eliminado' });
        } catch (e) { next(e); }
    }
}

export default SoftwareController;
