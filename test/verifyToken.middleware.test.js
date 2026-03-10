import test from 'node:test';
import assert from 'node:assert/strict';
import verifyToken from '../src/middlewares/verifyToken.middleware.js';
import { generateToken } from '../src/utils/jwt.js';

function createRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

test('verifyToken acepta token valido y expone req.user', async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    const token = generateToken({ id: 7, role: 'Analista' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createRes();

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    verifyToken(req, res, next);

    assert.equal(nextCalled, true);
    assert.deepEqual(req.user.id, 7);
    assert.deepEqual(req.user.role, 'Analista');
});

test('verifyToken rechaza cuando no hay token', async () => {
    const req = { headers: {} };
    const res = createRes();
    let nextCalled = false;

    verifyToken(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /token no proporcionado/i);
});
