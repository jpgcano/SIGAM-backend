class MaintenanceService {
    constructor(maintenanceModel) {
        this.maintenanceModel = maintenanceModel;
    }

    async findAll() {
        return this.maintenanceModel.findAll();
    }

    async create(payload) {
        return this.maintenanceModel.create(payload);
    }
}

export default MaintenanceService;
