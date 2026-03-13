import buildAuditContext from '../utils/auditContext.js';

class UserController {
    constructor(userService) {
        this.userService = userService;
        this.getAll = this.getAll.bind(this);
        this.create = this.create.bind(this);
    }

    async getAll(req, res, next) {
        try {
            const users = await this.userService.findAll();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const user = await this.userService.create(req.body, req.user, buildAuditContext(req));
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;
