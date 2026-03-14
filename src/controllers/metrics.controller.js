class MetricsController {
    constructor(service) {
        this.service = service;
        this.getOperational = this.getOperational.bind(this);
        this.getSummary = this.getSummary.bind(this);
    }

    async getOperational(req, res, next) {
        try {
            const metrics = await this.service.getOperationalMetrics();
            res.json(metrics);
        } catch (error) {
            next(error);
        }
    }

    async getSummary(req, res, next) {
        try {
            const metrics = await this.service.getSummaryMetrics();
            res.json(metrics);
        } catch (error) {
            next(error);
        }
    }
}

export default MetricsController;
