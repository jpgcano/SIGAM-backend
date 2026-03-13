import test from 'node:test';
import assert from 'node:assert/strict';
import TicketService from '../src/services/ticket.service.js';

function createModelStub() {
    return {
        createCalls: [],
        closeCalls: [],
        updateEstadoCalls: [],
        isReportedByUserCalls: [],
        isAssignedToTecnicoCalls: [],
        async create(payload) {
            this.createCalls.push(payload);
            return { id_ticket: 1, ...payload };
        },
        async closeWithConsumos(id, consumos) {
            this.closeCalls.push({ id, consumos });
            return { id_ticket: id, estado: 'Cerrado' };
        },
        async updateEstado(id, estado) {
            this.updateEstadoCalls.push({ id, estado });
            return { id_ticket: id, estado };
        },
        async isReportedByUser(id, userId) {
            this.isReportedByUserCalls.push({ id, userId });
            return true;
        },
        async isAssignedToTecnico(id, userId) {
            this.isAssignedToTecnicoCalls.push({ id, userId });
            return true;
        }
    };
}

test('TicketService.create falla cuando falta descripcion', async () => {
    const model = createModelStub();
    const service = new TicketService(model, {
        assetModel: { findById: async () => ({ nivel_criticidad: 'Media' }) }
    });

    await assert.rejects(
        () => service.create({ id_activo: 1 }),
        (error) => error?.status === 400 && /descripcion/i.test(error?.message)
    );
});

test('TicketService.create falla cuando falta id_activo', async () => {
    const model = createModelStub();
    const service = new TicketService(model, {
        assetModel: { findById: async () => ({ nivel_criticidad: 'Media' }) }
    });

    await assert.rejects(
        () => service.create({ descripcion: 'No enciende' }),
        (error) => error?.status === 400 && /id_activo/i.test(error?.message)
    );
});

test('TicketService.create clasifica por palabras clave y asigna prioridad Alta cuando contiene quemado', async () => {
    const model = createModelStub();
    const service = new TicketService(model, {
        assetModel: { findById: async () => ({ nivel_criticidad: 'Media' }) }
    });

    const ticket = await service.create({
        id_activo: 10,
        descripcion: 'El equipo huele a QUEMADO y se apagó'
    }, { id: 4, role: 'Usuario' });

    assert.equal(ticket.prioridad_ia, 'Alta');
    assert.equal(ticket.clasificacion_nlp, 'Eléctrico');
    assert.equal(model.createCalls.length, 1);
    assert.equal(model.createCalls[0].prioridad_ia, 'Alta');
    assert.equal(model.createCalls[0].clasificacion_nlp, 'Eléctrico');
    assert.equal(model.createCalls[0].id_usuario_reporta, 4);
});

test('TicketService.create asigna prioridad Media y clasificacion Red en un caso de red', async () => {
    const model = createModelStub();
    const service = new TicketService(model, {
        assetModel: { findById: async () => ({ nivel_criticidad: 'Media' }) }
    });

    const ticket = await service.create({
        id_activo: 11,
        descripcion: 'Sin conexion a internet en el puesto de trabajo'
    }, { id: 5, role: 'Usuario' });

    assert.equal(ticket.prioridad_ia, 'Media');
    assert.equal(ticket.clasificacion_nlp, 'Red');
});

test('TicketService.create clasifica como Hardware por palabras clave de componente', async () => {
    const model = createModelStub();
    const service = new TicketService(model, {
        assetModel: { findById: async () => ({ nivel_criticidad: 'Media' }) }
    });

    const ticket = await service.create({
        id_activo: 12,
        descripcion: 'La pantalla y el teclado no responden'
    }, { id: 1, role: 'Usuario' });

    assert.equal(ticket.clasificacion_nlp, 'Hardware');
    assert.equal(ticket.prioridad_ia, 'Media');
});

test('TicketService.create clasifica como Software por palabras clave de sistema', async () => {
    const model = createModelStub();
    const service = new TicketService(model, {
        assetModel: { findById: async () => ({ nivel_criticidad: 'Media' }) }
    });

    const ticket = await service.create({
        id_activo: 13,
        descripcion: 'No puedo abrir la aplicacion después de la actualizacion'
    }, { id: 1, role: 'Usuario' });

    assert.equal(ticket.clasificacion_nlp, 'Software');
    assert.equal(ticket.prioridad_ia, 'Media');
});

test('TicketService.create deja clasificacion_nlp en null cuando no hay keywords', async () => {
    const model = createModelStub();
    const service = new TicketService(model, {
        assetModel: { findById: async () => ({ nivel_criticidad: 'Media' }) }
    });

    const ticket = await service.create({
        id_activo: 14,
        descripcion: 'Solicitud general de revisión'
    }, { id: 1, role: 'Usuario' });

    assert.equal(ticket.clasificacion_nlp, null);
    assert.equal(ticket.prioridad_ia, 'Media');
});

test('TicketService.create ignora prioridad_ia enviada por cliente y recalcula', async () => {
    const model = createModelStub();
    const service = new TicketService(model, {
        assetModel: { findById: async () => ({ nivel_criticidad: 'Media' }) }
    });

    const ticket = await service.create({
        id_activo: 15,
        descripcion: 'Reporte simple de red wifi',
        prioridad_ia: 'Crítica'
    }, { id: 1, role: 'Usuario' });

    assert.equal(ticket.prioridad_ia, 'Media');
    assert.equal(model.createCalls[0].prioridad_ia, 'Media');
});

test('TicketService.changeEstado usa cierre con consumos', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    const result = await service.changeEstado(
        10,
        'Cerrado',
        { role: 'Gerente' },
        [{ id_repuesto: 1, cantidad_usada: 2 }]
    );

    assert.equal(result.estado, 'Cerrado');
    assert.equal(model.closeCalls.length, 1);
    assert.equal(model.updateEstadoCalls.length, 0);
});

test('TicketService.findById rechaza acceso si usuario no es owner', async () => {
    const model = createModelStub();
    model.findById = async () => ({ id_ticket: 1 });
    model.isReportedByUser = async () => false;
    const service = new TicketService(model);

    await assert.rejects(
        () => service.findById(1, { role: 'Usuario', id: 99 }),
        (error) => error?.status === 403
    );
});
test('TicketService.changeEstado valida consumos antes de cerrar', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    await assert.rejects(
        () => service.changeEstado(10, 'Cerrado', { role: 'Gerente' }, [{ cantidad_usada: 1 }]),
        (error) => error?.status === 400 && /id_repuesto/i.test(error?.message)
    );

    await assert.rejects(
        () => service.changeEstado(10, 'Cerrado', { role: 'Gerente' }, [{ id_repuesto: 1, cantidad_usada: 0 }]),
        (error) => error?.status === 400 && /cantidad_usada/i.test(error?.message)
    );
});
