class TicketController {
    constructor(service) {
        this.service = service;
        ['getAll','getById','getByActivo','getAssigned','getMetrics','create','update','changeEstado','remove']
            .forEach(m => this[m] = this[m].bind(this));
    }
    async getAll(req, res, next) {
        try { res.json(await this.service.findAll()); } catch (e) { next(e); }
    }
    async getById(req, res, next) {
        try { res.json(await this.service.findById(req.params.id)); } catch (e) { next(e); }
    }
    async getByActivo(req, res, next) {
        try { res.json(await this.service.findByActivo(req.params.id_activo)); } catch (e) { next(e); }
    }
    async getAssigned(req, res, next) {
        try { res.json(await this.service.findAssignedByTecnico(req.user.id)); } catch (e) { next(e); }
    }
    async getMetrics(req, res, next) {
        try {
            const raw = req.query?.id_activo;
            let id_activo = undefined;
            if (raw !== undefined) {
                const parsed = Number(raw);
                if (!Number.isInteger(parsed) || parsed <= 0) {
                    throw { status: 400, message: 'id_activo debe ser un entero positivo' };
                }
                id_activo = parsed;
            }
            res.json(await this.service.getMetrics({ id_activo }));
        } catch (e) { next(e); }
    }
    async create(req, res, next) {
        try { res.status(201).json(await this.service.create(req.body)); } catch (e) { next(e); }
    }
    async update(req, res, next) {
        try { res.json(await this.service.update(req.params.id, req.body, req.user)); } catch (e) { next(e); }
    }
    async changeEstado(req, res, next) {
        try { res.json(await this.service.changeEstado(req.params.id, req.body?.estado, req.user)); } catch (e) { next(e); }
    }
    async remove(req, res, next) {
        try {
            await this.service.remove(req.params.id);
            res.json({ message: 'Ticket eliminado' });
        } catch (e) { next(e); }
    }
}
export default TicketController;
