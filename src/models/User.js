import BaseModel from './BaseModel.js';


class UserModel extends BaseModel {
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
