class IaJobsController {
    constructor(service) {
        this.service = service;
        ['generatePurchaseSuggestions', 'generateDisposalSuggestions', 'reprocessTicketsExternal', 'generatePreventiveMaintenance'].forEach((m) => (this[m] = this[m].bind(this)));
    }

    async generatePurchaseSuggestions(req, res, next) {
        try {
            const windowDays = req.body?.windowDays ?? req.query?.windowDays;
            const horizonDays = req.body?.horizonDays ?? req.query?.horizonDays;
            res.json(await this.service.generatePurchaseSuggestions({ windowDays, horizonDays }));
        } catch (e) {
            next(e);
        }
    }

    async generateDisposalSuggestions(req, res, next) {
        try {
            const windowDays = req.body?.windowDays ?? req.query?.windowDays;
            const thresholdPct = req.body?.thresholdPct ?? req.query?.thresholdPct;
            res.json(await this.service.generateDisposalSuggestions({ windowDays, thresholdPct }));
        } catch (e) {
            next(e);
        }
    }

    async reprocessTicketsExternal(req, res, next) {
        try {
            const limit = req.body?.limit ?? req.query?.limit;
            const sinceDays = req.body?.sinceDays ?? req.query?.sinceDays;
            res.json(await this.service.reprocessTicketsExternal({ limit, sinceDays }));
        } catch (e) {
            next(e);
        }
    }

    async generatePreventiveMaintenance(req, res, next) {
        try {
            const intervalDays = req.body?.intervalDays ?? req.query?.intervalDays;
            const scheduleOffsetDays = req.body?.scheduleOffsetDays ?? req.query?.scheduleOffsetDays;
            const limit = req.body?.limit ?? req.query?.limit;
            res.json(await this.service.generatePreventiveMaintenance({
                intervalDays,
                scheduleOffsetDays,
                limit,
                reporterUserId: req.user?.id
            }));
        } catch (e) {
            next(e);
        }
    }
}

export default IaJobsController;
