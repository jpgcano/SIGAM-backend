import test from 'node:test';
import assert from 'node:assert/strict';
import TicketService from '../src/services/ticket.service.js';

function createModelStub() {
    return {
        createCalls: [],
        async create(payload) {
            this.createCalls.push(payload);
            return { id_ticket: 1, ...payload };
        }
    };
}

test('TicketService.create falla cuando falta descripcion', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    assert.throws(
        () => service.create({ id_activo: 1 }),
        (error) => error?.status === 400 && /descripcion/i.test(error?.message)
    );
});

test('TicketService.create falla cuando falta id_activo', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    assert.throws(
        () => service.create({ descripcion: 'No enciende' }),
        (error) => error?.status === 400 && /id_activo/i.test(error?.message)
    );
});

test('TicketService.create clasifica por palabras clave y asigna prioridad Alta cuando contiene quemado', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    const ticket = await service.create({
        id_activo: 10,
        id_usuario_reporta: 4,
        descripcion: 'El equipo huele a QUEMADO y se apagó'
    });

    assert.equal(ticket.prioridad_ia, 'Alta');
    assert.equal(ticket.clasificacion_nlp, 'Eléctrico');
    assert.equal(model.createCalls.length, 1);
    assert.equal(model.createCalls[0].prioridad_ia, 'Alta');
    assert.equal(model.createCalls[0].clasificacion_nlp, 'Eléctrico');
});

test('TicketService.create asigna prioridad Media y clasificacion Red en un caso de red', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    const ticket = await service.create({
        id_activo: 11,
        id_usuario_reporta: 5,
        descripcion: 'Sin conexion a internet en el puesto de trabajo'
    });

    assert.equal(ticket.prioridad_ia, 'Media');
    assert.equal(ticket.clasificacion_nlp, 'Red');
});

test('TicketService.create clasifica como Hardware por palabras clave de componente', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    const ticket = await service.create({
        id_activo: 12,
        descripcion: 'La pantalla y el teclado no responden'
    });

    assert.equal(ticket.clasificacion_nlp, 'Hardware');
    assert.equal(ticket.prioridad_ia, 'Media');
});

test('TicketService.create clasifica como Software por palabras clave de sistema', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    const ticket = await service.create({
        id_activo: 13,
        descripcion: 'No puedo abrir la aplicacion después de la actualizacion'
    });

    assert.equal(ticket.clasificacion_nlp, 'Software');
    assert.equal(ticket.prioridad_ia, 'Media');
});

test('TicketService.create deja clasificacion_nlp en null cuando no hay keywords', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    const ticket = await service.create({
        id_activo: 14,
        descripcion: 'Solicitud general de revisión'
    });

    assert.equal(ticket.clasificacion_nlp, null);
    assert.equal(ticket.prioridad_ia, 'Media');
});

test('TicketService.create ignora prioridad_ia enviada por cliente y recalcula', async () => {
    const model = createModelStub();
    const service = new TicketService(model);

    const ticket = await service.create({
        id_activo: 15,
        descripcion: 'Reporte simple de red wifi',
        prioridad_ia: 'Crítica'
    });

    assert.equal(ticket.prioridad_ia, 'Media');
    assert.equal(model.createCalls[0].prioridad_ia, 'Media');
});
