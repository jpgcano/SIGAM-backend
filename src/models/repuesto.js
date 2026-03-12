import BaseModel from './BaseModel.js';


class RepuestoModel extends BaseModel {
    async findAll() {
        return this.dbFindAll('repuestos', 'id_repuesto');
    }

    async findById(id) {
        return this.dbFindById('repuestos', 'id_repuesto', id);
    }

    async findBajoStock() {
        return this.dbFindAll('vw_repuestos_bajo_stock');
    }

    async create({ nombre, stock, stock_minimo }) {
        return this.dbCreate('repuestos', {
            nombre,
            stock: stock ?? 0,
            stock_minimo: stock_minimo ?? 5
        });
    }

    async update(id, { nombre, stock, stock_minimo }) {
        return this.dbUpdate('repuestos', 'id_repuesto', id, {
            nombre,
            stock,
            stock_minimo
        });
    }

    async remove(id) {
        return this.dbRemove('repuestos', 'id_repuesto', id);
    }
}

export default RepuestoModel;
