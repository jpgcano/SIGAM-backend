class MetricsController {
    constructor(service) {
        this.service = service;
        this.getOperational = this.getOperational.bind(this);
    }

    async getOperational(req, res, next) {
        try {
            const metrics = await this.service.getOperationalMetrics();
            res.json(metrics);
        } catch (error) {
            next(error);
        }
    }
}

export default MetricsController;
