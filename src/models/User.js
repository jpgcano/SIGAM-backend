import BaseModel from './BaseModel.js';

// Users model: DB access for users table operations.
class UserModel extends BaseModel {
    // Find user by email (includes password hash for login checks).
    async findByEmail(email) {
        return this.dbFindById(
            'usuarios',
            'email',
            email,
            ['id_usuario', 'nombre', 'email', 'password_hash', 'rol']
        );
    }

    async findAll() {
        return this.dbFindAll(
            'usuarios',
            'id_usuario',
            'ASC',
            ['id_usuario', 'nombre', 'email', 'rol', 'fecha_creacion']
        );
    }

    // Find user by id (without password hash).
    async findById(id) {
        return this.dbFindById(
            'usuarios',
            'id_usuario',
            id,
            ['id_usuario', 'nombre', 'email', 'rol', 'fecha_creacion']
        );
    }

    async create({ nombre, email, passwordHash, rol }) {
        return this.dbCreate(
            'usuarios',
            { nombre, email, password_hash: passwordHash, rol },
            ['id_usuario', 'nombre', 'email', 'rol', 'fecha_creacion']
        );
    }

    // Update basic user fields.
    async update(id, { nombre, email, rol }) {
        return this.dbUpdate(
            'usuarios',
            'id_usuario',
            id,
            { nombre, email, rol },
            ['id_usuario', 'nombre', 'email', 'rol', 'fecha_creacion']
        );
    }

    async updateRole(id, rol) {
        return this.dbUpdate(
            'usuarios',
            'id_usuario',
            id,
            { rol },
            ['id_usuario', 'nombre', 'email', 'rol', 'fecha_creacion']
        );
    }

    async updatePassword(id, passwordHash) {
        return this.dbUpdate(
            'usuarios',
            'id_usuario',
            id,
            { password_hash: passwordHash },
            ['id_usuario', 'nombre', 'email', 'rol', 'fecha_creacion']
        );
    }

    async remove(id) {
        return this.dbRemove(
            'usuarios',
            'id_usuario',
            id,
            ['id_usuario', 'nombre', 'email']
        );
    }
}

export default UserModel;
