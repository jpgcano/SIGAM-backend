class TicketController {
    constructor(ticketService) {
        this.ticketService = ticketService;
        this.getAll = this.getAll.bind(this);
        this.create = this.create.bind(this);
    }

    async getAll(req, res, next) {
        try {
            const tickets = await this.ticketService.findAll();
            res.json(tickets);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const ticket = await this.ticketService.create(req.body);
            res.status(201).json(ticket);
        } catch (error) {
            next(error);
        }
    }
}

export default TicketController;
