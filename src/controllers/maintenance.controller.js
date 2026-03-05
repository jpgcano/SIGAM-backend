class MaintenanceController {
    constructor(maintenanceService) {
        this.maintenanceService = maintenanceService;
        this.getAll = this.getAll.bind(this);
        this.create = this.create.bind(this);
    }

    async getAll(req, res, next) {
        try {
            const orders = await this.maintenanceService.findAll();
            res.json(orders);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const order = await this.maintenanceService.create(req.body);
            res.status(201).json(order);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MaintenanceController;
