import AuditLogService from './auditLog.service.js';

class LicenciaService {
    constructor(model, auditLogService = new AuditLogService()) {
        this.model = model;
        this.auditLogService = auditLogService;
    }
    findAll() { return this.model.findAll(); }
    async findById(id) {
        const r = await this.model.findById(id);
        if (!r) throw { status: 404, message: `Licencia ${id} no encontrada` };
        return r;
    }
    async create(payload, actor, auditContext) {
        if (!payload.clave_producto) throw { status: 400, message: 'clave_producto es requerido' };
        const created = await this.model.create(payload);
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: created?.id_licencia,
                accion: 'LICENCIA_CREATE',
                payload_after: created
            })
        );
        return created;
    }
    async update(id, payload, actor, auditContext) {
        const before = await this.model.findById(id);
        const r = await this.model.update(id, payload);
        if (!r) throw { status: 404, message: `Licencia ${id} no encontrada` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: id,
                accion: 'LICENCIA_UPDATE',
                payload_before: before,
                payload_after: r
            })
        );
        return r;
    }
    async remove(id, actor, auditContext) {
        const before = await this.model.findById(id);
        const r = await this.model.remove(id);
        if (!r) throw { status: 404, message: `Licencia ${id} no encontrada` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: id,
                accion: 'LICENCIA_DELETE',
                payload_before: before,
                payload_after: r
            })
        );
        return r;
    }
    async asignar(payload, actor, auditContext) {
        const assigned = await this.model.asignar(payload);
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: payload?.id_licencia,
                accion: 'LICENCIA_ASSIGN',
                payload_after: assigned,
                metadata: {
                    id_usuario: payload?.id_usuario ?? null,
                    id_activo: payload?.id_activo ?? null
                }
            })
        );
        return assigned;
    }
    getAsignaciones(id) { return this.model.getAsignaciones(id); }
    async revocarAsignacion(id, actor, auditContext) {
        const r = await this.model.revocarAsignacion(id);
        if (!r) throw { status: 404, message: `Asignación ${id} no encontrada` };
        this.auditLogService.safeLog(
            this.auditLogService.buildDomainEntry({
                actor,
                context: auditContext,
                entidad: 'LICENCIA',
                entidad_id: id,
                accion: 'LICENCIA_REVOKE',
                payload_after: r
            })
        );
        return r;
    }
}
export default LicenciaService;
