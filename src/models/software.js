import BaseModel from './BaseModel.js';


// Data access for software catalog entries.
class SoftwareModel extends BaseModel {
    // List all software entries.
    async findAll() {
        return this.dbFindAll('software', 'id_software');
    }

    // Fetch a software entry by id.
    async findById(id) {
        return this.dbFindById('software', 'id_software', id);
    }

    // Create a new software entry.
    async create({ nombre, fabricante }) {
        return this.dbCreate('software', { nombre, fabricante });
    }

    // Update a software entry.
    async update(id, { nombre, fabricante }) {
        return this.dbUpdate('software', 'id_software', id, { nombre, fabricante });
    }

    // Delete a software entry.
    async remove(id) {
        return this.dbRemove('software', 'id_software', id);
    }
}

export default SoftwareModel;
