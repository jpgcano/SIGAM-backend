import HashUtil from '../utils/hash.js';

class UserService {
    constructor(userModel) {
        this.userModel = userModel;
    }

    async findAll() {
        return this.userModel.findAll();
    }

    async create(payload) {
        const { nombre, email, password, rol } = payload;
        const passwordHash = await HashUtil.hashPassword(password);
        return this.userModel.create({ nombre, email, passwordHash, rol });
    }
}

export default UserService;
