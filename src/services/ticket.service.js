class TicketService {
    constructor(ticketModel) {
        this.ticketModel = ticketModel;
    }

    async findAll() {
        return this.ticketModel.findAll();
    }

    async create(payload) {
        return this.ticketModel.create(payload);
    }
}

export default TicketService;
