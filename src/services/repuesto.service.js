import AuditLogService from './auditLog.service.js';

class RepuestoService {
    constructor(model, auditLogService = new AuditLogService()) {
        this.model = model;
        this.auditLogService = auditLogService;
    }
    findAll() { return this.model.findAll(); }
    findBajoStock() { return this.model.findBajoStock(); }
    async findById(id) {
        const r = await this.model.findById(id);
        if (!r) throw { status: 404, message: `Repuesto ${id} no encontrado` };
        return r;
    }
    async create(payload, actor, auditContext) {
        const created = await this.model.create(payload);
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'REPUESTO',
                entidad_id: created?.id_repuesto,
                accion: 'REPUESTO_CREATE',
                payload_after: created
            })
        );
        return created;
    }
    async update(id, payload, actor, auditContext) {
        const before = await this.model.findById(id);
        const r = await this.model.update(id, payload);
        if (!r) throw { status: 404, message: `Repuesto ${id} no encontrado` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'REPUESTO',
                entidad_id: id,
                accion: 'REPUESTO_UPDATE',
                payload_before: before,
                payload_after: r
            })
        );
        const stockChanged = payload?.stock !== undefined && Number(before?.stock) !== Number(r?.stock);
        const stockMinChanged = payload?.stock_minimo !== undefined && Number(before?.stock_minimo) !== Number(r?.stock_minimo);
        if (stockChanged || stockMinChanged) {
            this.auditLogService.safeLog(
                this.auditLogService.buildDomainEntry({
                    actor,
                    context: auditContext,
                    entidad: 'REPUESTO',
                    entidad_id: id,
                    accion: 'REPUESTO_ADJUST',
                    payload_before: before,
                    payload_after: r,
                    metadata: {
                        stock_before: before?.stock ?? null,
                        stock_after: r?.stock ?? null,
                        stock_minimo_before: before?.stock_minimo ?? null,
                        stock_minimo_after: r?.stock_minimo ?? null
                    }
                })
            );
        }
        return r;
    }
    async remove(id, actor, auditContext) {
        const before = await this.model.findById(id);
        const r = await this.model.remove(id);
        if (!r) throw { status: 404, message: `Repuesto ${id} no encontrado` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'REPUESTO',
                entidad_id: id,
                accion: 'REPUESTO_DELETE',
                payload_before: before,
                payload_after: r
            })
        );
        return r;
    }
}
export default RepuestoService;
