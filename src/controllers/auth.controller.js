import { generateToken } from '../utils/jwt.js';

class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.login(email, password);
            const token = generateToken({ id: user.id, role: user.role });
            res.status(200).json({ token, user });
        } catch (error) {
            error.status = 401;
            next(error);
        }
    }

    async register(req, res, next) {
        try {
            const user = await this.authService.register(req.body, req.user);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;
