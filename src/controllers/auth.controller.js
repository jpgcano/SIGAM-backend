import { generateToken } from '../utils/jwt.js';
import buildAuditContext from '../utils/auditContext.js';

// Auth controller: HTTP layer for login and registration flows.
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    // Authenticate credentials, issue JWT, and return user profile.
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.login(email, password, buildAuditContext(req));
            const token = generateToken({ id: user.id, role: user.role });
            res.status(200).json({ token, user });
        } catch (error) {
            error.status = 401;
            next(error);
        }
    }

    // Register a new user (role assignment enforced in the service).
    async register(req, res, next) {
        try {
            const user = await this.authService.register(req.body, req.user, buildAuditContext(req));
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;
