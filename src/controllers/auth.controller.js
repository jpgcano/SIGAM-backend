const jwt = require('../utils/jwt');

class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.login = this.login.bind(this);
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.login(email, password);
            const token = jwt.generateToken({ id: user.id, role: user.role });
            res.status(200).json({ token, user });
        } catch (error) {
            error.status = 401;
            next(error);
        }
    }
}

module.exports = AuthController;
