class MetricsService {
    constructor(model) {
        this.model = model;
    }

    getOperationalMetrics() {
        return this.model.getOperationalMetrics();
    }
}

export default MetricsService;
