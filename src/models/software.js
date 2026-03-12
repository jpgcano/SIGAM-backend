import BaseModel from './BaseModel.js';


class SoftwareModel extends BaseModel {
    async findAll() {
        return this.dbFindAll('software', 'id_software');
    }

    async findById(id) {
        return this.dbFindById('software', 'id_software', id);
    }

    async create({ nombre, fabricante }) {
        return this.dbCreate('software', { nombre, fabricante });
    }

    async update(id, { nombre, fabricante }) {
        return this.dbUpdate('software', 'id_software', id, { nombre, fabricante });
    }

    async remove(id) {
        return this.dbRemove('software', 'id_software', id);
    }
}

export default SoftwareModel;

