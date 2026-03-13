import buildAuditContext from '../utils/auditContext.js';

class UserController {
    constructor(userService) {
        this.userService = userService;
        this.getAll = this.getAll.bind(this);
        this.create = this.create.bind(this);
        this.updateRole = this.updateRole.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
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

    async updateRole(req, res, next) {
        try {
            const user = await this.userService.updateRole(
                req.params.id,
                req.body?.rol,
                req.user,
                buildAuditContext(req)
            );
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const user = await this.userService.resetPassword(
                req.params.id,
                req.body?.password,
                req.user,
                buildAuditContext(req)
            );
            res.json({ message: 'Password actualizado', user });
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;
