const HashUtil = require('../utils/hash');

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
}

module.exports = AuthService;
