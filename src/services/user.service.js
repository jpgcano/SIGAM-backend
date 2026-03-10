import HashUtil from '../utils/hash.js';
import { ALLOWED_ROLES_SET } from '../config/roles.js';

class UserService {
    constructor(userModel) {
        this.userModel = userModel;
    }

    async findAll() {
        return this.userModel.findAll();
    }

    async create(payload) {
        const { nombre, email, password, rol } = payload;
        if (!ALLOWED_ROLES_SET.has(rol)) {
            throw { status: 400, message: `rol inválido: ${rol}` };
        }
        const passwordHash = await HashUtil.hashPassword(password);
        return this.userModel.create({ nombre, email, passwordHash, rol });
    }
}

export default UserService;
