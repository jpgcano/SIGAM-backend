class MetricsService {
    constructor(model) {
        this.model = model;
    }

    getOperationalMetrics() {
        return this.model.getOperationalMetrics();
    }

    getSummaryMetrics() {
        return this.model.getSummaryMetrics();
    }
}

export default MetricsService;
