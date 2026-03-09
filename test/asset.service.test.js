import test from 'node:test';
import assert from 'node:assert/strict';
import AssetService from '../src/services/asset.service.js';

function createAssetModelStub() {
    return {
        removeCalls: [],
        async findById(id) {
            return id === 1 ? { id_activo: 1 } : null;
        },
        async remove(id, motivo, certificado) {
            this.removeCalls.push({ id, motivo, certificado });
            return { id_baja: 99, id_activo: id, motivo, borrado_seguro: certificado };
        }
    };
}

test('AssetService.findById retorna 404 cuando no existe el activo', async () => {
    const service = new AssetService(createAssetModelStub());

    await assert.rejects(
        () => service.findById(999),
        (error) => error?.status === 404
    );
});

test('AssetService.remove exige motivo_baja y certificado_borrado', async () => {
    const service = new AssetService(createAssetModelStub());

    await assert.rejects(
        () => service.remove(1, '', ''),
        (error) => error?.status === 400 && /ISO 27001/.test(error?.message)
    );
});

test('AssetService.remove procesa baja cuando payload es valido', async () => {
    const model = createAssetModelStub();
    const service = new AssetService(model);

    const result = await service.remove(2, 'Fin de vida útil', 'CERT-12345');

    assert.equal(result.id_activo, 2);
    assert.equal(model.removeCalls.length, 1);
});
