import HashUtil from '../utils/hash.js';
import { ALLOWED_ROLES_SET } from '../config/roles.js';

class AuthService {
    constructor(userModel) {
        this.userModel = userModel;
    }

    async login(email, password) {
        const user = await this.userModel.findByEmail(email);
        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        const ok = await HashUtil.comparePassword(password, user.password_hash);
        if (!ok) {
            throw new Error('Credenciales inválidas');
        }

        return {
            id: user.id_usuario,
            nombre: user.nombre,
            email: user.email,
            role: user.rol
        };
    }

    async register({ nombre, email, password, rol }) {
        if (!ALLOWED_ROLES_SET.has(rol)) {
            throw { status: 400, message: `rol inválido: ${rol}` };
        }
        const passwordHash = await HashUtil.hashPassword(password);
        const created = await this.userModel.create({
            nombre,
            email,
            passwordHash,
            rol
        });

        return {
            id: created.id_usuario,
            nombre: created.nombre,
            email: created.email,
            role: created.rol,
            fecha_creacion: created.fecha_creacion
        };
    }
}

export default AuthService;
