import test from 'node:test';
import assert from 'node:assert/strict';
import AuthService from '../src/services/auth.service.js';
import HashUtil from '../src/utils/hash.js';

function createUserModelStub(user) {
    return {
        async findByEmail() {
            return user;
        }
    };
}

test('AuthService.login retorna usuario cuando credenciales son validas', async () => {
    const password = 'Secreta123';
    const passwordHash = await HashUtil.hashPassword(password);
    const user = {
        id_usuario: 9,
        nombre: 'Ana',
        email: 'ana@acme.com',
        password_hash: passwordHash,
        rol: 'Analista'
    };

    const service = new AuthService(createUserModelStub(user));
    const result = await service.login('ana@acme.com', password);

    assert.deepEqual(result, {
        id: 9,
        nombre: 'Ana',
        email: 'ana@acme.com',
        role: 'Analista'
    });
});

test('AuthService.login falla cuando el usuario no existe', async () => {
    const service = new AuthService(createUserModelStub(null));

    await assert.rejects(
        () => service.login('no@acme.com', 'x'),
        /Credenciales inválidas/i
    );
});

test('AuthService.login falla cuando la password es incorrecta', async () => {
    const passwordHash = await HashUtil.hashPassword('correcta');
    const user = {
        id_usuario: 4,
        nombre: 'Carlos',
        email: 'carlos@acme.com',
        password_hash: passwordHash,
        rol: 'Gerente'
    };

    const service = new AuthService(createUserModelStub(user));

    await assert.rejects(
        () => service.login('carlos@acme.com', 'incorrecta'),
        /Credenciales inválidas/i
    );
});

test('AuthService.register hashea password y no expone texto plano', async () => {
    let capturedPayload = null;
    const model = {
        async create(payload) {
            capturedPayload = payload;
            return {
                id_usuario: 77,
                nombre: payload.nombre,
                email: payload.email,
                rol: payload.rol,
                fecha_creacion: '2026-03-10T00:00:00Z'
            };
        }
    };

    const service = new AuthService(model);
    const user = await service.register({
        nombre: 'Luisa',
        email: 'luisa@acme.com',
        password: 'Secreta123',
        rol: 'Técnico'
    });

    assert.equal(user.email, 'luisa@acme.com');
    assert.equal(user.role, 'Técnico');
    assert.ok(capturedPayload.passwordHash);
    assert.notEqual(capturedPayload.passwordHash, 'Secreta123');
});
