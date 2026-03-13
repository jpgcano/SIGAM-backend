import AuditLogService from './auditLog.service.js';

class AssetService {
    constructor(assetModel, auditLogService = new AuditLogService()) {
        this.assetModel = assetModel;
        this.auditLogService = auditLogService;
    }

    static generateCodigoQR() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
        return `ACT-${yyyy}${mm}${dd}-${rand}`;
    }

    static computeFechaObsolescencia(fechaCompra, vidaUtil) {
        if (!fechaCompra || !vidaUtil) return null;
        const base = new Date(fechaCompra);
        if (Number.isNaN(base.getTime())) return null;
        const months = Number(vidaUtil);
        if (!Number.isFinite(months)) return null;
        const result = new Date(base);
        result.setMonth(result.getMonth() + months);
        return result.toISOString().slice(0, 10);
    }

    static withObsolescence(asset) {
        if (!asset) return asset;
        const fecha_obsolescencia = AssetService.computeFechaObsolescencia(
            asset.fecha_compra,
            asset.vida_util
        );
        return { ...asset, fecha_obsolescencia };
    }

    async findAll() {
        const assets = await this.assetModel.findAll();
        return Array.isArray(assets)
            ? assets.map((asset) => AssetService.withObsolescence(asset))
            : assets;
    }

    async findById(id) {
        const asset = await this.assetModel.findById(id);
        if (!asset) throw { status: 404, message: `Activo con id ${id} no encontrado` };
        return AssetService.withObsolescence(asset);
    }

    async create(payload, actor, auditContext) {
        if (!payload?.serial) {
            throw { status: 400, message: 'serial es requerido' };
        }
        const existing = await this.assetModel.findBySerial(payload.serial);
        if (existing) {
            throw { status: 409, message: `serial duplicado: ${payload.serial}` };
        }

        const normalizedPayload = {
            ...payload,
            codigo_qr: payload.codigo_qr || AssetService.generateCodigoQR()
        };
        const asset = await this.assetModel.create(normalizedPayload);
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'ACTIVO',
                entidad_id: asset?.id_activo,
                accion: 'ACTIVO_CREATE',
                payload_after: asset
            })
        );
        return AssetService.withObsolescence(asset);
    }

    async update(id, payload, actor, auditContext) {
        const before = await this.assetModel.findById(id);
        const asset = await this.assetModel.update(id, payload);
        if (!asset) throw { status: 404, message: `Activo con id ${id} no encontrado` };
        if (payload?.estado_activo !== undefined) {
            const estado = payload.estado_activo ? 'Activo' : 'Inactivo';
            await this.assetModel.addHistory(
                id,
                'Cambio de estado',
                `Estado actualizado a "${estado}"`
            );
        }
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'ACTIVO',
                entidad_id: asset?.id_activo ?? id,
                accion: 'ACTIVO_UPDATE',
                payload_before: before,
                payload_after: asset
            })
        );
        return AssetService.withObsolescence(asset);
    }

    async remove(id, motivoBaja, certificadoBorrado, actor, auditContext) {
        if (!motivoBaja || !certificadoBorrado) {
            throw { status: 400, message: 'motivo_baja y certificado_borrado son requeridos (ISO 27001)' };
        }
        const before = await this.assetModel.findById(id);
        const result = await this.assetModel.remove(id, motivoBaja, certificadoBorrado);
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'ACTIVO',
                entidad_id: id,
                accion: 'ACTIVO_DELETE',
                payload_before: before,
                payload_after: result,
                metadata: {
                    motivo_baja: motivoBaja,
                    certificado_borrado: certificadoBorrado
                }
            })
        );
        return result;
    }

    async getHistory(id) {
        return this.assetModel.getHistory(id);
    }
}

export default AssetService;
