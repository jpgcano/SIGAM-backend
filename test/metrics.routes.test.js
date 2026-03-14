import test from 'node:test';
import assert from 'node:assert/strict';
import metricsRouter from '../src/routes/metrics.routes.js';

function hasRoute(path, method) {
    return metricsRouter.stack.some(
        (l) => l.route && l.route.path === path && l.route.methods?.[method]
    );
}

test('Metrics routes exponen /operacion y /resumen', async () => {
    assert.ok(hasRoute('/operacion', 'get'));
    assert.ok(hasRoute('/resumen', 'get'));
});
