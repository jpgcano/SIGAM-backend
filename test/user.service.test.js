import test from 'node:test';
import assert from 'node:assert/strict';
import UserService from '../src/services/user.service.js';

function createModelStub() {
    return {
        createCalls: [],
        async create(payload) {
            this.createCalls.push(payload);
            return { id_usuario: 1, ...payload };
        }
    };
}

test('UserService.create falla cuando rol es invalido', async () => {
    const model = createModelStub();
    const service = new UserService(model);

    await assert.rejects(
        () => service.create({ nombre: 'A', email: 'a@a.com', password: 'x', rol: 'Root' }),
        (error) => error?.status === 400 && /rol/i.test(error?.message)
    );
});

test('UserService.create permite rol valido', async () => {
    const model = createModelStub();
    const service = new UserService(model);

    const user = await service.create({ nombre: 'B', email: 'b@b.com', password: 'x', rol: 'Analista' });

    assert.equal(user.rol, 'Analista');
    assert.equal(model.createCalls.length, 1);
});
